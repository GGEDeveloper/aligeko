import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.NEON_DB_URL || process.env.DATABASE_URL;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Modelos simplificados apenas para diagnóstico
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  status: DataTypes.STRING
}, { tableName: 'categories', timestamps: false });

const Producer = sequelize.define('Producer', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  status: DataTypes.STRING
}, { tableName: 'producers', timestamps: false });

const Unit = sequelize.define('Unit', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  symbol: DataTypes.STRING
}, { tableName: 'units', timestamps: false });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  category_id: DataTypes.INTEGER,
  producer_id: DataTypes.INTEGER,
  unit_id: DataTypes.INTEGER,
  status: DataTypes.STRING
}, { tableName: 'products', timestamps: false });

const Image = sequelize.define('Image', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  product_id: DataTypes.INTEGER,
  url: DataTypes.STRING,
  is_primary: DataTypes.BOOLEAN
}, { tableName: 'images', timestamps: false });

// Configuração das associações
Product.belongsTo(Category, { foreignKey: 'category_id' });
Product.belongsTo(Producer, { foreignKey: 'producer_id' });
Product.belongsTo(Unit, { foreignKey: 'unit_id' });
Product.hasMany(Image, { foreignKey: 'product_id' });

async function generateReport() {
  try {
    console.log('🔍 Iniciando diagnóstico completo do banco de dados...\n');
    
    // 1. Contagem de registros
    const [
      productsCount,
      categoriesCount,
      producersCount,
      unitsCount,
      imagesCount
    ] = await Promise.all([
      Product.count(),
      Category.count(),
      Producer.count(),
      Unit.count(),
      Image.count()
    ]);

    // 2. Produtos sem relacionamentos
    const [
      noCategory,
      noProducer,
      noUnit,
      noImage
    ] = await Promise.all([
      sequelize.query('SELECT COUNT(*) as count FROM products WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories)', { type: Sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM products WHERE producer_id IS NULL OR producer_id NOT IN (SELECT id FROM producers)', { type: Sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(*) as count FROM products WHERE unit_id IS NULL OR unit_id NOT IN (SELECT id FROM units)', { type: Sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT COUNT(DISTINCT p.id) as count FROM products p LEFT JOIN images i ON p.id = i.product_id WHERE i.id IS NULL', { type: Sequelize.QueryTypes.SELECT })
    ]);

    // 3. Status dos produtos
    const productsByStatus = await Product.findAll({
      attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']],
      group: ['status']
    });

    // 4. Categorias mais utilizadas
    const topCategories = await Category.findAll({
      attributes: [
        'id', 'name',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'product_count']
      ],
      include: [{
        model: Product,
        attributes: [],
        required: false
      }],
      group: ['Category.id'],
      order: [[sequelize.literal('product_count'), 'DESC']],
      limit: 10
    });

    // 5. Gerar relatório
    console.log('📊 RELATÓRIO COMPLETO DO BANCO DE DADOS\n');
    
    // 5.1 Estatísticas Gerais
    console.log('📈 ESTATÍSTICAS GERAIS');
    console.log('----------------------');
    console.log(`📦 Total de Produtos: ${productsCount}`);
    console.log(`🏷️  Total de Categorias: ${categoriesCount}`);
    console.log(`🏭 Total de Fabricantes: ${producersCount}`);
    console.log(`📏 Total de Unidades: ${unitsCount}`);
    console.log(`🖼️  Total de Imagens: ${imagesCount}\n`);

    // 5.2 Status dos Produtos
    console.log('📊 DISTRIBUIÇÃO POR STATUS');
    console.log('-------------------------');
    productsByStatus.forEach(item => {
      console.log(`- ${item.get('status') || 'Sem status'}: ${item.get('count')} produtos`);
    });
    console.log('');

    // 5.3 Problemas de Integridade
    console.log('⚠️  PROBLEMAS DE INTEGRIDADE');
    console.log('---------------------------');
    console.log(`❌ Produtos sem categoria válida: ${noCategory[0].count}`);
    console.log(`❌ Produtos sem fabricante válido: ${noProducer[0].count}`);
    console.log(`❌ Produtos sem unidade válida: ${noUnit[0].count}`);
    console.log(`❌ Produtos sem imagens: ${noImage[0].count}\n`);

    // 5.4 Categorias mais utilizadas
    if (topCategories.length > 0) {
      console.log('🏆 TOP 10 CATEGORIAS MAIS UTILIZADAS');
      console.log('----------------------------------');
      topCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (ID: ${cat.id}): ${cat.get('product_count')} produtos`);
      });
      console.log('');
    }

    // 5.5 Exemplo de produtos problemáticos
    if (noCategory[0].count > 0) {
      console.log('🔍 EXEMPLO DE PRODUTOS SEM CATEGORIA VÁLIDA');
      console.log('-----------------------------------------');
      const exampleProducts = await sequelize.query(
        'SELECT id, name, category_id FROM products WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories) LIMIT 5',
        { type: Sequelize.QueryTypes.SELECT }
      );
      exampleProducts.forEach(p => {
        console.log(`- [ID: ${p.id}] ${p.name} (category_id: ${p.category_id})`);
      });
      console.log('');
    }

    console.log('✅ Diagnóstico concluído com sucesso!');
    console.log('💡 Dica: Use as informações acima para priorizar correções no banco de dados.');

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

generateReport();
