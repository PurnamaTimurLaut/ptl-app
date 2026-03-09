const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordAzami = await bcrypt.hash('password1412', 10)
  const passwordRai = await bcrypt.hash('password140806', 10)
  const defaultPassword = await bcrypt.hash('password123', 10)

  const director = await prisma.user.upsert({
    where: { email: 'director@ptl.com' },
    update: {},
    create: {
      email: 'director@ptl.com',
      name: 'Director Bob',
      password: defaultPassword,
      role: 'DIRECTOR',
    },
  })

  const operational = await prisma.user.upsert({
    where: { email: 'operational@ptl.com' },
    update: {},
    create: {
      email: 'operational@ptl.com',
      name: 'Ops Alice',
      password: defaultPassword,
      role: 'OPERATIONAL',
    },
  })

  const azami = await prisma.user.upsert({
    where: { email: 'azami@ptl.com' },
    update: { password: passwordAzami }, // update password if already exists
    create: {
      email: 'azami@ptl.com',
      name: 'Azami',
      password: passwordAzami,
      role: 'DIRECTOR',
    },
  })

  const rai = await prisma.user.upsert({
    where: { email: 'rai@ptl.com' },
    update: { password: passwordRai },
    create: {
      email: 'rai@ptl.com',
      name: 'Rai',
      password: passwordRai,
      role: 'OPERATIONAL',
    },
  })

  console.log({ director, operational, azami, rai })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
