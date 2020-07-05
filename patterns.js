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
    [
	[0,5],  [0,10], [0,11], [0,16],
	[1,5],  [1,11], [1,16],
	[2,11], [2,16],
	[3,0],  [3,9],  [3,15],
	[4,0],  [4,1],  [4,2], [4,3], [4,8], [4,15],
	[5,14], [5,19], [5,20],
	[6,6],  [6,7],  [6,12], [6,13],
	[7,5],  [7,10], [7,11], [7,16],
	[8,4],  [8,17],
	[9,8],  [9,9],  [9,14], [9,15],
	[10,0], [10,1], [10,2], [10,7], [10,13],  [10,18], [10,19], [10,20],
	[11,5], [11,6],
    ],
    [
	[0,7], [0,12],
	[1,7], [1,12],
	[2,12],
	[3,3], [3,9], [3,10], [3,15], [3,16],
	[4,0], [4,1], [4,2],
	[5,6], [5,7], [5,8], [5,14], [5,18], [5,19], [5,20],
	[6,4], [6,5], [6,11],
	[7,12], [7, 13], [7,17],
	[8,0], [8,9], [8,16],
	[9,0], [9,1], [9,2], [9,3], [9,8], [9,14], [9,15],
	[10,0], [10,10], [10,20],
	[11,5], [11,6], [11,12],
    ]
];


const patterns = {
    15: patterns15,
    21: patterns21
};

let loadedPatterns = "";

for( var key in patterns ) {
    loadedPatterns = loadedPatterns + key + "x" + key + " (" + (patterns[key]).length + " patterns); ";
}

console.log("Loaded patterns for square grids of these sizes: " + loadedPatterns );
