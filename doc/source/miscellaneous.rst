.. Documentation about using Phil's miscellaneous features

Miscellaneous Features
======================

Statistics
----------
Puzzle statistics are given in the lower right hand portion of the
page. It shows how many clues have been completed out of the total
number (and illustrates this by way of a bar graph). It also shows the
number of black squares and the proportion they comprise of the entire
number of squares in the puzzle.

And if you invoke autofill, you'll see the number of candidate words
evaluated, the time that autofill has run and the rate it has evaluated
words during this run.
 
For example:

.. image:: images/Phil-Stats.png

.. note:: Best practices recommend keeping the percentage of black
	  squares to no more than 16%. Getting nearer this number
	  will cause this statistic to be rendered in orange and above
	  it in red.

	  Likewise, the total number of clues should be less than 78
	  (for a 15x15 puzzle) and 140 (for a 21x21 puzzle). Getting
	  near these values causes orange and then red displays.

Blocked Squares
---------------
A square is said to be "blocked" if a word of at least three letters
cannot be formed from it in both the horizontal and vertical
directions. If you place a black square such that it blocks other
squares, Phil will color these blocked squares. For instance, the
black square just to the left of 13 blocks six other squares.

.. image:: images/Blocked.png

Auto Save Count
---------------
Setting Auto Save Count to a non-zero value will automatically save
the puzzle in Phil's "native" format every that many changes (e.g.,
filling in an answer's letter, adding a clue, adding or removing a
black square, etc.). Here's an example where it will automatically
save after every 50th change:

.. image:: images/Auto-Save-Count.png
