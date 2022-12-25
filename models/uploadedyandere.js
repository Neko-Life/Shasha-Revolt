'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UploadedYandere extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UploadedYandere.hasMany(models.SentYandere);
    }
  }
  UploadedYandere.init({
    filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    autumn_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UploadedYandere',
  });
  return UploadedYandere;
};
