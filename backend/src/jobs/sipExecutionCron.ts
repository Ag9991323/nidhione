import cron from 'node-cron';
import prisma from '../config/database';
import { getNAVBySchemeCode } from '../utils/amfiAPI';
import { calculateSimpleReturns } from '../utils/xirr';
import { config } from '../config';

export function startSIPExecutionCron() {
  console.log('Starting SIP execution cron job...');

  cron.schedule(config.cron.sipExecution, async () => {
    console.log('Running SIP execution job...');

    try {
      await executePendingSIPs();
      console.log('SIP execution completed successfully');
    } catch (error) {
      console.error('Error in SIP execution cron:', error);
    }
  });
}

async function executePendingSIPs() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingSIPs = await prisma.sIP.findMany({
      where: {
        status: 'active',
        nextExecutionDate: {
          lte: today,
        },
      },
      include: {
        mutualFund: true,
      },
    });

    console.log(`Found ${pendingSIPs.length} SIPs to execute`);

    for (const sip of pendingSIPs) {
      try {
        // Fetch current NAV
        const currentNAV = await getNAVBySchemeCode(sip.mutualFund.schemeCode);

        if (!currentNAV) {
          console.error(`Could not fetch NAV for SIP ${sip.id}`);
          continue;
        }

        // Calculate new units
        const newUnits = sip.amount / currentNAV;
        const totalUnits = sip.mutualFund.units + newUnits;

        // Calculate new average NAV
        const totalInvested = sip.mutualFund.investedAmount + sip.amount;
        const newAverageNAV = totalInvested / totalUnits;

        const currentValue = totalUnits * currentNAV;
        const { returns, returnsPercentage } = calculateSimpleReturns(totalInvested, currentValue);

        // Update mutual fund
        await prisma.mutualFund.update({
          where: { id: sip.mfId },
          data: {
            units: totalUnits,
            averageNav: newAverageNAV,
            investedAmount: totalInvested,
            currentNav: currentNAV,
            currentValue,
            returns,
            returnsPercentage,
            lastUpdated: new Date(),
          },
        });

        // Calculate next execution date
        const nextDate = new Date(sip.nextExecutionDate);
        if (sip.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (sip.frequency === 'quarterly') {
          nextDate.setMonth(nextDate.getMonth() + 3);
        }

        // Update SIP
        await prisma.sIP.update({
          where: { id: sip.id },
          data: {
            nextExecutionDate: nextDate,
          },
        });

        console.log(
          `Executed SIP ${sip.id}: Added ${newUnits.toFixed(4)} units at NAV ${currentNAV}`,
        );
      } catch (error) {
        console.error(`Error executing SIP ${sip.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in executePendingSIPs:', error);
  }
}
