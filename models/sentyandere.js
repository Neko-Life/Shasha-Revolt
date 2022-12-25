'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SentYandere extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SentYandere.belongsTo(models.UploadedYandere);
    }
  }
  SentYandere.init({
    channel_id: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    UploadedYandereId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
	model: "UploadedYanderes",
	key: "id",
      },
    },
  }, {
    sequelize,
    modelName: 'SentYandere',
  });
  return SentYandere;
};
