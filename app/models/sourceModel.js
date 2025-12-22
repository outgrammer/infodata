import { DataTypes } from 'sequelize'

// 定义信息源模型工厂函数
const SourceModel = (sequelize) => {
  return sequelize.define('source', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    }
    // created_at和updated_at由Sequelize自动生成
  }, {
    tableName: 'sources' // 明确指定表名
  })
}

// 导出模型工厂函数
export default SourceModel
