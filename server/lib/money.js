/*
Copyright 2012, 2013 Jake Blatchford, Mike Garwood, Will Oliver, Jonathan Scherrer, Tom Verran

This file is part of Unisim.

Unisim is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Unisim is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Unisim.  If not, see <http://www.gnu.org/licenses/>.
*/

exports.Money = function() {

    var balance;
    var moneyChanged = false;

    /**
     * Initialize the money module.
     * @param {number} amount - the starting balance amount.
     */
    this.initialize = function(amount) {
        balance = amount;
    };

    /**
     * Set whether the money has been changed.
     * @param {boolean} value - boolean to set moneyChanged.
     */
    this.setChanged = function(value) {
        moneyChanged = value;
    };

    /**
     * Return the current balance.
     * @return {number} - balance of the server.
     */
    this.getBalance = function() {
        return balance;
    };

    /**
     * Get whether the money has been changed.
     * @return {boolean} - moneyChanged boolean.
     */
    this.getChanged = function() {
        return moneyChanged;
    };

    /**
     * Request to spend / purchase something with a specific amount.
     * Subtracts the specified amount if balance is larger than amount.
     * @param {number} amount - the amount of money of the spend operation.
     * @return {boolean} true if the operation was successful.
     */
    this.spend = function(amount) {
        if (balance >= amount) {
            balance -= amount;
            moneyChanged = true;
            return true;
        }
        return false;
    };

    /**
     * Increase the balance.
     * @param {number} amount - the amount of money to gain.
     */
    this.payment = function(amount) {
        balance += amount;
        moneyChanged = true;
    };

};
