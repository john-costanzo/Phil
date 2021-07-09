.. Documentation about using Phil's menu items

Phil's Menu items
=================
Menu items are found on the left-hand side of the page.

.. |new-puzzle| image:: images/New-Puzzle.png
.. |open-puzzle| image:: images/Open-Puzzle.png
.. |export-as| image:: images/Export-As.png
.. |quick-layout| image:: images/Quick-Layout.png
.. |freeze-pattern| image:: images/Freeze-Pattern.png
.. |clear-white-squares| image:: images/Clear-White-Squares.png
.. |toggle-symmetry| image:: images/Toggle-Symmetry.png
.. |toggle-recommended-answers| image:: images/Toggle-Recommended-Answers.png
.. |auto-fill-puzzle| image:: images/Auto-Fill-Puzzle.png
.. |regular-expression-matching| image:: images/Regular-Expression-Matching.png
.. |check-duplicates| image:: images/Check-Duplicates.png
.. |change-dictionary| image:: images/Change-Dictionary.png
.. |undo| image:: images/Undo.png
.. |redo| image:: images/Redo.png
.. |toggle-usage-assistance| image:: images/Toggle-Usage-Assistance.png
.. |auto-save-count| image:: images/Auto-Save-Count.png

.. glossary ::

    |new-puzzle|
        Create a new puzzle.

    |open-puzzle|
        Brings up a previously saved puzzle.

    |export-as|
        Save the current puzzle in various formats:

	- **Phil puzzle** (.xw) is the standard format. 

          Note that if |auto-save-count| is greater than zero, the
	  puzzle will automatically be saved in this format after the
	  specified number of changes.

	- **Across Lite** (.puz) is the format used by `Across Lite <https://www.litsoft.com/across/alite/download/>`_
	- **Printable version** (.pdf) displays the blank grid along with clues
	- **NYT submission** displays a form suitable for submission
	  to the *New York Times*. It includes a blank grid, all clues
	  and a filled in grid.

    |quick-layout|
        Layout an empty grid that is either 15x15 or 21x21. Repeated
	requests for a quick layout selects from a small set of grid
	patterns. 

    |freeze-pattern|
        Freezes the pattern from structural changes (i.e., adding or
	removing black squares).

    |clear-white-squares|
        Clears answers in the white squares.

    |toggle-symmetry|
        Toggles whether the grid puzzle pattern must be symmetric.

    |toggle-recommended-answers|
        Toggles whether *all* answers matching a the puzzle pattern
	are displayed or only moderately- and highly-recommended ones
	are. See `Recommended Answers
	<recommendations.html#recommended-answers>`_  for more details.

    |auto-fill-puzzle|
        First, save a copy of the puzzle (just in case you need to recover
	the puzzle's state).

        Next, fill in empty grid cells with letters from words drawn
        from the current dictionary. This option seeks to use words
        that work in both horizontal and vertical directions, but this
        may take a *very* long time to run and may, in the end, not
        even be possible. This options is best used to fill in small 
	numbers of empty cells, perhaps with a liberal use of 
	regular expressions to limit the number of candidates to try.

	Finally, when the grid has been successfully filled or all
        possible words have been attempted, "check-duplicates" is run.

        Click this icon a second time to suspend the operation.

    |regular-expression-matching|
        Constrain suggested answers to those meeting regular express
	patterns. See `Regular Expressions
	<regex.html#regular-expressions-in-phil>`_ for details.

    |check-duplicates|
        Check for duplicate answers. This reports on answers which are
	either exact duplicates or where an answer is found as a
	substring of another answer.

    |change-dictionary|
        Change the dictionary used for suggesting answers. A
        dictionary file is simply a text file with one word per line.

    |undo|
        Undo changes you've made. See
	`Undo <undo.html#undoing-and-redoing-changes>`_ for details.

    |redo|
        Redo changes you've previously undone. See
	`Redo <undo.html#undoing-and-redoing-changes>`_ for details.

    |toggle-usage-assistance|
        Display assistance in using this application.
