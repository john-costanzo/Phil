// Phil
// ------------------------------------------------------------------------
// Copyright 2017 Keiran King

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// (https://www.apache.org/licenses/LICENSE-2.0)

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

// Patterns for a 15x15 grid
const patterns15 = [
    [
      [0,4], [1,4], [2,4], [12,4], [13,4], [14,4],
      [4,0], [4,1], [4,2], [4,12], [4,13], [4,14],
      [8,3], [7,4], [6,5], [5,6], [4,7], [3,8]
    ],
    [
      [0,4], [1,4], [2,4], [12,4], [13,4], [14,4],
      [6,0], [10,0], [6,1], [10,1], [10,2], [8,4],
      [5,3], [9,3], [4,5], [11,5], [6,6], [7,7]
    ],
    [
      [0,5], [1,5], [2,5], [12,4], [13,4], [14,4],
      [5,0], [5,1], [5,2], [4,3], [3,13], [3,14],
      [5,6], [4,7], [4,8], [6,9], [7,10], [5,11]
    ]
];

// Patterns for a 21x21 grid
const patterns21 = [
    [
	[0,5],  [0,10], [0,14],  [0,15],
	[1,5],  [1,10], [1,15],
	[2,15],
	[3,4],  [3,11], [3,17],
	[4,0],  [4,1],  [4,2],   [4,6],
	[5,6],  [5,7],  [5,8],   [5,12], [5,18], [5,19], [5,20],
	[6,5],  [6,9],  [6,10],  [6,16],
	[7,13], [7,17],
	[8,3],  [8,11], [8,15],
	[9,4],  [9,8],  [9,14],  [9,15],
	[10,0], [10,1], [10,19], [10,20],
	[11,5], [11,6], [11,12], [11,16],
    ],
];

const patterns = {
    15: patterns15,
    21: patterns21
};

console.log("Loaded patterns for square grids of these sizes: " + Object.keys(patterns).join(", ") );
