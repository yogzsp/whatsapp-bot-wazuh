'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class command extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  command.init({
    id_agent: DataTypes.STRING,
    level: DataTypes.INTEGER,
    command: DataTypes.STRING,
    delay: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Command',
  });
  return command;
};
