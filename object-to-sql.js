/*
* @ {AUTHOR} FERIDUN AKPINAR
* This module is a SQL query generator for the mysql package's query function
*
* Features:
* It allows users to generate parameterized sql queries
* It prepares SQL query from given parameters
* It parameterizes column names without need of writing them in advance when using mysql packge
* It provides LIMIT AND ORDER clauses as well
*
*
* Below are the properties of the query object
* 
* * TYPE            * ORDER                  * CONDITION                   * LIMIT
* object.queryType  object.order.columns     object.condition.columns      object.limit.count
*                   object.order.directions  object.condition.operators
*                                            object.condition.values
*                                            object.condition.logicalOperators
*
*
* * SELECT               * INSERT                 * UPDATE                 * DROP
* object.select.table    object.insert.table      object.update.table      object.drop.table
* object.select.columns  object.insert.columns    object.update.columns
*                        object.insert.values     object.update.values
*
*
* * DELETE              * CREATE         
* object.delete.table   object.create.table
*                       object.create.columns
*                       object.create.types
*                       object.create.constrains
*
*
* See documentation for quick tutorial.
*
*/

/**
* Class to represent a single query
* 
*/
class Query {


    // Input object which contains necessary query constructs
    input;
    // Ready SQL query
    sqlQuery = "";
    // Values of SQL query variables
    values = [];
    // Tells whether this query is valid
    isValid = false;

    /**
    * Constructor
    * @param {object} input Object which contains query details
    */
    constructor(input) {
        this.input = input;
        if (this.input)
            switch (this.input.queryType[0]) {
                case "SELECT":
                    this.prepareSelectQuery();
                    break;

                case "INSERT":
                    this.prepareInsertQuery();
                    break;

                case "UPDATE":
                    this.prepareUpdateQuery();
                    break;

                case "DROP":
                    this.prepareDropQuery();
                    break;

                case "DELETE":
                    this.prepareDeleteQuery();
                    break;

                case "CREATE":
                    this.prepareCreateQuery();
                    break;
            }
    }


    /****************** GETTERS AND SETTERS ********************/

    /**
    * Getter for sqlQuery variable
    * 
    */
    getSQLQuery() {
        return this.sqlQuery;
    }


    /****************** FUNCTIONS FOR PREPARING SQL QUERIES (SYNTAX) ********************/


    /**
    * SQL query generator for SELECT statement
    * 
    */
    prepareSelectQuery() {
        try {
            this.sqlQuery = "SELECT";
            if (this.input.select && this.input.select.columns) this.sqlQuery += " " + this.surroundArrayWithBraces(this.input.select.columns);
            else this.sqlQuery += " " + "*";
            this.sqlQuery += " " + "FROM" + " " + this.input.select.table[0];

            if (this.input.condition && this.input.condition.columns) {
                this.sqlQuery += " " + this.prepareConditionSubQuery(this.input);
                this.values.push(...this.input.condition.values);
            }
            if (this.input.order && this.input.order.columns) this.sqlQuery += " " + this.prepareOrderSubQuery(this.input);
            this.isValid = true;
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * SQL query generator for INSERT statement
     * 
     */
    prepareInsertQuery() {
        try {
            this.sqlQuery = "INSERT INTO";
            this.sqlQuery += " " + this.input.insert.table[0];

            if (this.input.insert && this.input.insert.columns) {
                this.sqlQuery += this.surroundArrayWithBraces(this.input.insert.columns);
            }

            this.sqlQuery += " " + "VALUES";
            this.sqlQuery += " " + "?";

            this.values.push([]);

            for (let i in this.input.insert.values) {
                if (Array.isArray(this.input.insert.values[i])) {
                    this.values[0].push(this.input.insert.values[i]);
                }
            }

            if (this.values[0].length !== 1) {
                this.values[0].push([...this.input.insert.values]);
            }
            this.isValid = true;
        } catch (error) {
            console.log(error);
        }
    }

    /**
    * SQL query generator for UPDATE statement
    * 
    */
    prepareUpdateQuery() {
        try {
            this.sqlQuery += "UPDATE";
            this.sqlQuery += " " + this.input.update.table[0];

            this.sqlQuery += " " + "SET";

            let tmpArray = [];
            for (let i in this.input.update.columns) {
                tmpArray.push(this.input.update.columns[i] + "=" + "?");
            }
            for (let i in tmpArray) {
                if (i != tmpArray.length - 1) this.sqlQuery += " " + tmpArray[i] + ",";
                else this.sqlQuery += " " + tmpArray[i];
            }

            this.values.push(...this.input.update.values);

            if (this.input.condition && this.input.condition.columns) {
                this.sqlQuery += " " + this.prepareConditionSubQuery(this.input);
                this.values.push(...this.input.condition.values);
            }

            if (this.input.limit && this.input.limit.count) this.sqlQuery += " " + this.prepareLimitSubQuery();
            this.isValid = true;
        } catch (err) {
            console.log(err);
        }
    }

    /**
    * SQL query generator for DROP statement
    * 
    */
    prepareDropQuery() {
        try {
            this.sqlQuery = "DROP";
            this.sqlQuery += " " + this.input.drop.table;
        } catch (error) {
            console.log(error)
        }
    }


    /**
    * SQL query generator for DELETE statement
    * 
    */
    prepareDeleteQuery() {
        try {
            this.sqlQuery = "DELETE FROM";
            this.sqlQuery += " " + this.input.delete.table;
            this.sqlQuery += " " + this.prepareConditionSubQuery();
            this.values.push(...this.input.condition.values);
        } catch (error) {
            console.log(error);
        }
    }


    /**
    * SQL query generator for CREATE statement
    * 
    */
    prepareCreateQuery() {
        try {
            this.sqlQuery += "CREATE TABLE";
            this.sqlQuery += " " + this.input.create.table[0];

            let tmpArray = [];

            for (let i = 0; i < this.input.create.columns.length; i++) {
                let tmp = "";
                tmp += this.input.create.columns[i];
                tmp += " " + this.input.create.types[i];
                if (this.input.create.constrains && this.input.create.constrains[i]) tmp += " " + this.input.create.constrains[i];
                tmpArray.push(tmp);
            }

            this.sqlQuery += " " + this.surroundArrayWithBraces(tmpArray);
        } catch (error) {
            console.log(error);
        }
    }



    /***** SUBQUERIES (CLAUSES) AND UTILITY FUNCTIONS ****/


    /**
    * SQL clause generator for WHERE
    * 
    */
    prepareConditionSubQuery() {
        try {
            let text = "WHERE";
            for (let i = 0; i < this.input.condition.columns.length; i++) {
                if (!Array.isArray(this.input.condition.columns[i])) {
                    text += " " + this.input.condition.columns[i] + " " + this.input.condition.operators[i] + " " + "?";
                    if (i != this.input.condition.columns.length - 1) text += " " + this.input.condition.logicalOperators[i];
                }
                else {
                    text += " " + "(";
                    for (let j = 0; j < this.input.condition.columns[i].length; j++) {
                        text += " " + this.input.condition.columns[i][j] + " " + this.input.condition.operators[i][j] + " " + "?";
                        if (j != this.input.condition.columns[i].length - 1) text += " " + this.input.condition.logicalOperators[i][j];
                        else {
                            text += " " + ")";
                            if (i != this.input.condition.columns.length - 1) text += " " + this.input.condition.logicalOperators[i][j];
                        }
                    }
                }
            }
            return text;
        } catch (error) {
            console.log(error);
            throw "Failed to prepare the condition subquery";
        }
    }



    /**
    * SQL clause generator for ORDER
    * 
    */
    prepareOrderSubQuery() {
        try {
            let text = "ORDER BY";
            for (let i = 0; i < this.input.order.columns.length; i++) {
                if (i != this.input.order.columns.length - 1) {
                    text += " " + this.input.order.columns[i];
                    if (this.input.order.directions && this.input.order.directions[i]) text += " " + this.input.order.directions[i];
                    text += ",";
                } else {
                    text += " " + this.input.order.columns[i];
                    if (this.input.order.directions && this.input.order.directions[i]) text += " " + this.input.order.directions[i];
                }
            }
            return text;
        } catch (error) {
            console.log(error);
            throw "Failed to prepare the order subquery";
        }
    }


    /**
    * SQL clause generator for LIMIT
    * 
    */
    prepareLimitSubQuery() {
        try {
            let text = "LIMIT";
            text += " " + this.input.limit.count[0];

            return text;
        } catch (error) {
            console.log(error);
            throw "Failed to prepare the limit subquery";
        }
    }


    /**
    * Represent array in (..., ..., ...) format
    * 
    */
    surroundArrayWithBraces(array) {
        try {
            let text = "(";
            for (let i in array) {
                if (i != array.length - 1) text += array[i] + "," + " ";
                else text += array[i] + ")";
            }
            return text;
        } catch (error) {
            console.log(error);
            throw "Failed to surround array values with braces";
        }
    }

}

module.exports = Query;