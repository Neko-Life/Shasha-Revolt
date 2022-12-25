'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UploadedYanderes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filename: {
        type: Sequelize.TEXT,
	allowNull: false,
      },
      autumn_id: {
	type: Sequelize.TEXT,
	allowNull: false,
      },
      createdAt: {
	allowNull: false,
	type: Sequelize.DATE
      },
      updatedAt: {
	allowNull: false,
	type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UploadedYanderes');
  }
};
