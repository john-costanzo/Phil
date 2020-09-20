.. Documentation about Recommended answers in Phil

Recommended Answers
===================

Phil will suggest answers based on letters already entered into the
grid. To do this, it uses a dictionary of common words and/or popular
crossword answers.

It indicates four levels of increasingly desirable answers, as
depicted by the style of the words:

.. role:: suggested
.. role:: recommended
.. role:: moderately-recommended
.. role:: highly-recommended
.. raw:: html

   <style> .suggested {color: grey} </style>
   <style> .recommended {color: black} </style>
   <style> .moderately-recommended {color:#55b8fe; font-weight: bold;} </style>
   <style> .highly-recommended {color: blue; font-weight: bold; font-size: larger; } </style>

- :suggested:`Words` that match letters in the puzzle pattern (*"suggested" answers*)
- :recommended:`Words` that also match a suggestion in the opposite direction.
  (*"recommended" answers*)
- :moderately-recommended:`Words` that match suggestions in the opposite direction for all
  letters in the word. (*"moderately recommended" answers*)
- :highly-recommended:`Words` that match all letters from *moderately recommended*
  suggestions in the opposite direction. (*"highly recommended"
  answers*)

.. note:: Even *highly recommended* answers do not necessarily allow
	  for a completed grid... but they are the most rigorously
	  checked.

If

.. image:: images/Suggest-On-Empty.png

is selected, answers will be suggested even if the grid pattern for
the answer has no letters filled in.

.. note:: This could cause the application to run quite slowly,
	  especially for longer words.
