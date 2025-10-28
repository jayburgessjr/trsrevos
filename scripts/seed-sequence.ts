import { prisma } from '../src/lib/prisma';

async function main() {
  const sequence = await prisma.sequence.upsert({
    where: { name: 'Default' },
    update: {},
    create: {
      name: 'Default',
      maxDailySends: 30,
      quietStart: 20,
      quietEnd: 7,
    },
  });

  await prisma.messageTemplate.upsert({
    where: { id: 'seed-step-1' },
    update: {
      sequenceId: sequence.id,
    },
    create: {
      id: 'seed-step-1',
      sequenceId: sequence.id,
      step: 1,
      subject: 'Quick intro',
      body: '{{body}}',
      delayHours: 0,
    },
  });

  console.log('Seeded sequence:', sequence.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
