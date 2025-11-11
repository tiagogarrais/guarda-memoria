const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePessoasToEntidades() {
  console.log('Iniciando migração de Pessoas para Entidades...');

  try {
    // Buscar todas as pessoas existentes
    const pessoas = await prisma.pessoa.findMany({
      include: {
        comentarios: true,
        medias: true,
        curtidas: true,
        denuncias: true,
      },
    });

    console.log(`Encontradas ${pessoas.length} pessoas para migrar`);

    for (const pessoa of pessoas) {
      console.log(`Migrando pessoa: ${pessoa.nome}`);

      // Criar entidade correspondente
      const entidade = await prisma.entidade.create({
        data: {
          tipo: 'PESSOA',
          nome: pessoa.nome,
          descricao: pessoa.historia,
          fotoUrl: pessoa.fotoUrl,
          cidadeId: pessoa.cidadeId,
          usuarioId: pessoa.usuarioId,
          dataNascimento: pessoa.dataNascimento,
          profissao: pessoa.profissao,
          categoria: pessoa.categoria,
          tags: pessoa.tags,
        },
      });

      console.log(`Criada entidade ${entidade.id} para pessoa ${pessoa.id}`);

      // Migrar comentários
      if (pessoa.comentarios.length > 0) {
        await prisma.comentario.updateMany({
          where: { pessoaId: pessoa.id },
          data: { entidadeId: entidade.id },
        });
        console.log(`Migrados ${pessoa.comentarios.length} comentários`);
      }

      // Migrar mídias
      if (pessoa.medias.length > 0) {
        await prisma.media.updateMany({
          where: { pessoaId: pessoa.id },
          data: { entidadeId: entidade.id },
        });
        console.log(`Migradas ${pessoa.medias.length} mídias`);
      }

      // Migrar curtidas
      if (pessoa.curtidas.length > 0) {
        await prisma.curtida.updateMany({
          where: { pessoaId: pessoa.id },
          data: { entidadeId: entidade.id },
        });
        console.log(`Migradas ${pessoa.curtidas.length} curtidas`);
      }

      // Migrar denúncias
      if (pessoa.denuncias.length > 0) {
        await prisma.denuncia.updateMany({
          where: { pessoaId: pessoa.id },
          data: { entidadeId: entidade.id },
        });
        console.log(`Migradas ${pessoa.denuncias.length} denúncias`);
      }
    }

    console.log('Migração concluída com sucesso!');

    // Verificar se a migração foi bem-sucedida
    const entidadesCount = await prisma.entidade.count({ where: { tipo: 'PESSOA' } });
    const pessoasCount = await prisma.pessoa.count();

    console.log(`Entidades PESSOA criadas: ${entidadesCount}`);
    console.log(`Pessoas originais: ${pessoasCount}`);

    if (entidadesCount === pessoasCount) {
      console.log('✅ Migração verificada com sucesso!');
    } else {
      console.log('⚠️  Discrepância na contagem - verificar migração');
    }

  } catch (error) {
    console.error('Erro durante migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migratePessoasToEntidades()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });