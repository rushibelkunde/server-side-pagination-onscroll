import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // Define stages with order
  const stages = [
    { name: 'todo', order: 1 },
    { name: 'inprogress', order: 2 },
    { name: 'onhold', order: 3 },
    { name: 'completed', order: 4 },
  ]

  // Seed stages
  const stageRecords = await Promise.all(
    stages.map(stage => {
      return prisma.stage.create({
        data: {
          name: stage.name,
          order: stage.order,
        },
      })
    })
  )

  console.log('Stages created:', stageRecords.length)

  // Generate 50 projects per stage
  for (const stage of stageRecords) {
    for (let i = 0; i < 50; i++) {
      const project = await prisma.project.create({
        data: {
          name: `Project ${i + 1} for ${stage.name}`,
          stageId: stage.id,
        },
      })

      console.log(`Project ${project.name} created for stage ${stage.name}`)

      // Generate 50 tasks for each project
      for (let j = 0; j < 50; j++) {
        await prisma.task.create({
          data: {
            name: `Task ${j + 1} for ${project.name}`,
            projectId: project.id,
            stageId: stage.id,
          },
        })
      }

      console.log(`50 tasks created for project ${project.name}`)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
