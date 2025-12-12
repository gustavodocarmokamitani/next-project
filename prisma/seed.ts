import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categoriasPadrao = [
  'Adulto(a)',
  'Sub-23',
  'Juvenil',
  'Júnior',
  'Pré-Júnior',
  'Infantil',
  'T-Ball',
  'Sub-19',
  'Sub-17',
  'Sub-15',
  'Sub-13',
  'Universitário',
  'Amador'
]

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Cria organização "Sistema"
  let organizacaoSistema = await prisma.organization.findUnique({
    where: { name: 'Sistema' }
  })

  if (!organizacaoSistema) {
    organizacaoSistema = await prisma.organization.create({
      data: { name: 'Sistema' }
    })
    console.log('✅ Organização "Sistema" criada')
  } else {
    console.log('⏭️  Organização "Sistema" já existe')
  }

  // 2. Cria User Sistema (Super Admin)
  const systemPassword = await bcrypt.hash('sistema123', 10)
  let userSistema = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'sistema@admin.com' },
        { role: 'SYSTEM' }
      ]
    }
  })

  if (!userSistema) {
    userSistema = await prisma.user.create({
      data: {
        email: 'sistema@admin.com',
        password: systemPassword,
        name: 'Sistema Admin',
        role: 'SYSTEM',
        organizationId: organizacaoSistema.id,
        organizationName: 'Sistema'
      }
    })
    console.log('✅ User Sistema criado')
    console.log('   📧 Email: sistema@admin.com')
    console.log('   🔑 Senha: sistema123')
    console.log('   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
  } else {
    console.log('⏭️  User Sistema já existe')
  }

  // 3. Cria categorias globais (organizationId: null)
  for (const nomeCategoria of categoriasPadrao) {
    const categoriaExistente = await prisma.category.findFirst({
      where: {
        name: nomeCategoria,
        organizationId: null // Categorias globais
      }
    })

    if (!categoriaExistente) {
      await prisma.category.create({
        data: {
          name: nomeCategoria,
          organizationId: null // Categoria global
        }
      })
      console.log(`✅ Categoria global "${nomeCategoria}" criada`)
    } else {
      console.log(`⏭️  Categoria global "${nomeCategoria}" já existe`)
    }
  }

  console.log('✨ Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

