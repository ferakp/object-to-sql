## Description

This module provides functionality of generating an SQL query from an object.

It supports SELECT, INSERT, UPDATE, DELETE, DROP AND CREATE statements.

## Structure


<pre> TYPE                    ORDER                       CONDITION                               LIMIT </pre>
<pre> object.queryType        object.order.columns        object.condition.columns                object.limit.count</pre>
<pre>                         object.order.directions     object.condition.operators</pre>
<pre>                                                     object.condition.values</pre>
<pre>                                                     object.condition.logicalOperators</pre>
<br/>
<pre> SELECT                      INSERT                      UPDATE                        DROP</pre>
<pre> object.select.table         object.insert.table         object.update.table           object.drop.table</pre>
<pre> object.select.columns       object.insert.columns       object.update.columns</pre>                            
<pre>                             object.insert.values        object.update.values</pre>
<br/>
<pre> DELETE                      CREATE  </pre>     
<pre> object.delete.table         object.create.table</pre>
<pre>                             object.create.columns</pre>
<pre>                             object.create.types</pre>
<pre>                             object.create.constrains</pre>

