'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patron_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Loaned On Date is required"
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Return By is required"
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: "Returned On is required"
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Loan.belongsTo(models.Book, {foreignKey: 'book_id'});
        Loan.belongsTo(models.Patron, {foreignKey: 'patron_id'});
      }
    }
  });
  return Loan;
};