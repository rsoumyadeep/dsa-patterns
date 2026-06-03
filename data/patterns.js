// DSA Pattern Dependency Graph Data
// Contains 19 core patterns, their tier placement, dependency mappings, subpatterns, and representative LeetCode questions.

const PATTERNS = [
  {
    id: "arrays_hashing",
    label: "Arrays & Hashing",
    tier: 0,
    dependencies: [],
    subpatterns: [
      {
        id: "frequency_map",
        label: "Frequency Map",
        questions: [
          { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy" },
          { title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium" },
          { title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "Medium" },
          { title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium" }
        ]
      },
      {
        id: "hashing_for_existence",
        label: "Hashing for Existence / Sets",
        questions: [
          { title: "Contains Duplicate", url: "https://leetcode.com/problems/contains-duplicate/", difficulty: "Easy" },
          { title: "Longest Consecutive Sequence", url: "https://leetcode.com/problems/longest-consecutive-sequence/", difficulty: "Medium" },
          { title: "Intersection of Two Arrays", url: "https://leetcode.com/problems/intersection-of-two-arrays/", difficulty: "Easy" },
          { title: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", difficulty: "Easy" }
        ]
      },
      {
        id: "prefix_suffix_hashing",
        label: "Prefix / Suffix Hashing",
        questions: [
          { title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium" },
          { title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium" },
          { title: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum/", difficulty: "Medium" },
          { title: "Grid Game", url: "https://leetcode.com/problems/grid-game/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "stack",
    label: "Stack",
    tier: 0,
    dependencies: [],
    subpatterns: [
      {
        id: "parentheses_matching",
        label: "Parentheses Matching",
        questions: [
          { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" },
          { title: "Generate Parentheses", url: "https://leetcode.com/problems/generate-parentheses/", difficulty: "Medium" },
          { title: "Minimum Remove to Make Valid Parentheses", url: "https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/", difficulty: "Medium" },
          { title: "Score of Parentheses", url: "https://leetcode.com/problems/score-of-parentheses/", difficulty: "Medium" }
        ]
      },
      {
        id: "monotonic_stack",
        label: "Monotonic Stack",
        questions: [
          { title: "Next Greater Element I", url: "https://leetcode.com/problems/next-greater-element-i/", difficulty: "Easy" },
          { title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", difficulty: "Medium" },
          { title: "Online Stock Span", url: "https://leetcode.com/problems/online-stock-span/", difficulty: "Medium" },
          { title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "Hard" }
        ]
      },
      {
        id: "design_stack",
        label: "Stack Design",
        questions: [
          { title: "Min Stack", url: "https://leetcode.com/problems/min-stack/", difficulty: "Medium" },
          { title: "Implement Queue using Stacks", url: "https://leetcode.com/problems/implement-queue-using-stacks/", difficulty: "Easy" },
          { title: "Design Browser History", url: "https://leetcode.com/problems/design-browser-history/", difficulty: "Medium" },
          { title: "Implement Stack using Queues", url: "https://leetcode.com/problems/implement-stack-using-queues/", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "bit_manipulation",
    label: "Bit Manipulation",
    tier: 0,
    dependencies: [],
    subpatterns: [
      {
        id: "bitwise_operations",
        label: "Bitwise Operations",
        questions: [
          { title: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy" },
          { title: "Counting Bits", url: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy" },
          { title: "Reverse Bits", url: "https://leetcode.com/problems/reverse-bits/", difficulty: "Easy" },
          { title: "Power of Two", url: "https://leetcode.com/problems/power-of-two/", difficulty: "Easy" }
        ]
      },
      {
        id: "xor_tricks",
        label: "XOR Tricks",
        questions: [
          { title: "Single Number", url: "https://leetcode.com/problems/single-number/", difficulty: "Easy" },
          { title: "Missing Number", url: "https://leetcode.com/problems/missing-number/", difficulty: "Easy" },
          { title: "Single Number III", url: "https://leetcode.com/problems/single-number-iii/", difficulty: "Medium" },
          { title: "Find the Difference", url: "https://leetcode.com/problems/find-the-difference/", difficulty: "Easy" }
        ]
      },
      {
        id: "bit_masking",
        label: "Bit Masking",
        questions: [
          { title: "Subsets", url: "https://leetcode.com/problems/subsets/", difficulty: "Medium" },
          { title: "Maximum Product of Word Lengths", url: "https://leetcode.com/problems/maximum-product-of-word-lengths/", difficulty: "Medium" },
          { title: "Pseudo-Palindromic Paths in a Binary Tree", url: "https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/", difficulty: "Medium" },
          { title: "Matchsticks to Square", url: "https://leetcode.com/problems/matchsticks-to-square/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "two_pointers",
    label: "Two Pointers",
    tier: 1,
    dependencies: ["arrays_hashing"],
    subpatterns: [
      {
        id: "opposite_direction",
        label: "Opposite Direction Pointers",
        questions: [
          { title: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy" },
          { title: "Two Sum II - Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "Medium" },
          { title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium" },
          { title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "Medium" }
        ]
      },
      {
        id: "same_direction",
        label: "Same Direction / Fast-Slow",
        questions: [
          { title: "Move Zeroes", url: "https://leetcode.com/problems/move-zeroes/", difficulty: "Easy" },
          { title: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: "Easy" },
          { title: "Remove Duplicates from Sorted Array II", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/", difficulty: "Medium" },
          { title: "Compare Version Numbers", url: "https://leetcode.com/problems/compare-version-numbers/", difficulty: "Medium" }
        ]
      },
      {
        id: "two_arrays",
        label: "Pointers on Two Arrays",
        questions: [
          { title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/", difficulty: "Easy" },
          { title: "Intersection of Two Arrays II", url: "https://leetcode.com/problems/intersection-of-two-arrays-ii/", difficulty: "Easy" },
          { title: "Is Subsequence", url: "https://leetcode.com/problems/is-subsequence/", difficulty: "Easy" },
          { title: "Backspace String Compare", url: "https://leetcode.com/problems/backspace-string-compare/", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "prefix_sum",
    label: "Prefix Sum",
    tier: 1,
    dependencies: ["arrays_hashing"],
    subpatterns: [
      {
        id: "range_sum_queries",
        label: "Range Sum Queries",
        questions: [
          { title: "Range Sum Query - Immutable", url: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: "Easy" },
          { title: "Range Sum Query 2D - Immutable", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", difficulty: "Medium" },
          { title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: "Medium" },
          { title: "Path Sum III", url: "https://leetcode.com/problems/path-sum-iii/", difficulty: "Medium" }
        ]
      },
      {
        id: "prefix_difference",
        label: "Difference Array",
        questions: [
          { title: "Range Addition", url: "https://leetcode.com/problems/range-addition/", difficulty: "Medium" },
          { title: "Car Pooling", url: "https://leetcode.com/problems/car-pooling/", difficulty: "Medium" },
          { title: "Corporate Flight Bookings", url: "https://leetcode.com/problems/corporate-flight-bookings/", difficulty: "Medium" },
          { title: "Shifting Letters II", url: "https://leetcode.com/problems/shifting-letters-ii/", difficulty: "Medium" }
        ]
      },
      {
        id: "prefix_hashing",
        label: "Prefix Hashing / Set",
        questions: [
          { title: "Subarray Sums Divisible by K", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", difficulty: "Medium" },
          { title: "Contiguous Array", url: "https://leetcode.com/problems/contiguous-array/", difficulty: "Medium" },
          { title: "Find the Middle Index in Array", url: "https://leetcode.com/problems/find-the-middle-index-in-array/", difficulty: "Easy" },
          { title: "Make Sum Divisible by P", url: "https://leetcode.com/problems/make-sum-divisible-by-p/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "kadanes",
    label: "Kadane's Algorithm",
    tier: 1,
    dependencies: ["arrays_hashing"],
    subpatterns: [
      {
        id: "max_subarray",
        label: "Maximum Subarray Sum",
        questions: [
          { title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/", difficulty: "Medium" },
          { title: "Maximum Product Subarray", url: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: "Medium" },
          { title: "Maximum Sum Circular Subarray", url: "https://leetcode.com/problems/maximum-sum-circular-subarray/", difficulty: "Medium" },
          { title: "Longest Turbulent Subarray", url: "https://leetcode.com/problems/longest-turbulent-subarray/", difficulty: "Medium" }
        ]
      },
      {
        id: "subarray_constraints",
        label: "Kadane's with Constraints",
        questions: [
          { title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy" },
          { title: "Best Time to Buy and Sell Stock II", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/", difficulty: "Medium" },
          { title: "House Robber", url: "https://leetcode.com/problems/house-robber/", difficulty: "Medium" },
          { title: "Maximum Absolute Sum of Any Subarray", url: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/", difficulty: "Medium" }
        ]
      },
      {
        id: "multi_pass_kadanes",
        label: "Multi-pass / Flipping Kadane's",
        questions: [
          { title: "Maximum Subarray Sum with One Deletion", url: "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/", difficulty: "Medium" },
          { title: "Maximum Alternating Subarray Sum", url: "https://leetcode.com/problems/maximum-alternating-subarray-sum/", difficulty: "Medium" },
          { title: "Check If It Is a Good Array", url: "https://leetcode.com/problems/check-if-it-is-a-good-array/", difficulty: "Hard" },
          { title: "Maximum Subarray Min-Product", url: "https://leetcode.com/problems/maximum-subarray-min-product/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "binary_search",
    label: "Binary Search",
    tier: 1,
    dependencies: ["arrays_hashing"],
    subpatterns: [
      {
        id: "search_in_sorted",
        label: "Sorted Search",
        questions: [
          { title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "Easy" },
          { title: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix/", difficulty: "Medium" },
          { title: "Find First and Last Position of Element in Sorted Array", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", difficulty: "Medium" },
          { title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "Medium" }
        ]
      },
      {
        id: "search_space",
        label: "Binary Search on Answer",
        questions: [
          { title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "Medium" },
          { title: "Capacity To Ship Packages Within D Days", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", difficulty: "Medium" },
          { title: "Find the Smallest Divisor Given a Threshold", url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/", difficulty: "Medium" },
          { title: "Split Array Largest Sum", url: "https://leetcode.com/problems/split-array-largest-sum/", difficulty: "Hard" }
        ]
      },
      {
        id: "peak_finding",
        label: "Peak / Pivot Finding",
        questions: [
          { title: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element/", difficulty: "Medium" },
          { title: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "Medium" },
          { title: "Peak Index in a Mountain Array", url: "https://leetcode.com/problems/peak-index-in-a-mountain-array/", difficulty: "Medium" },
          { title: "Search in Rotated Sorted Array II", url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "sliding_window",
    label: "Sliding Window",
    tier: 2,
    dependencies: ["two_pointers"],
    subpatterns: [
      {
        id: "fixed_size",
        label: "Fixed Size Window",
        questions: [
          { title: "Maximum Sum of Distinct Subarrays With Length K", url: "https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k/", difficulty: "Medium" },
          { title: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/", difficulty: "Medium" },
          { title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "Medium" },
          { title: "Maximum Number of Vowels in a Substring of Given Length", url: "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/", difficulty: "Medium" }
        ]
      },
      {
        id: "variable_size_expand",
        label: "Variable Size - Expandable",
        questions: [
          { title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "Medium" },
          { title: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "Medium" },
          { title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", difficulty: "Medium" },
          { title: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/", difficulty: "Medium" }
        ]
      },
      {
        id: "variable_size_shrink",
        label: "Variable Size - Shrinking / Min Window",
        questions: [
          { title: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty: "Medium" },
          { title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "Hard" },
          { title: "Shortest Subarray with Sum at Least K", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", difficulty: "Hard" },
          { title: "Replace the Substring for Balanced String", url: "https://leetcode.com/problems/replace-the-substring-for-balanced-string/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "fast_slow_pointers",
    label: "Fast & Slow Pointers",
    tier: 2,
    dependencies: ["two_pointers"],
    subpatterns: [
      {
        id: "cycle_detection",
        label: "Cycle Detection",
        questions: [
          { title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy" },
          { title: "Linked List Cycle II", url: "https://leetcode.com/problems/linked-list-cycle-ii/", difficulty: "Medium" },
          { title: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "Medium" },
          { title: "Happy Number", url: "https://leetcode.com/problems/happy-number/", difficulty: "Easy" }
        ]
      },
      {
        id: "midpoint_finding",
        label: "Midpoint / Split Linked List",
        questions: [
          { title: "Middle of the Linked List", url: "https://leetcode.com/problems/middle-of-the-linked-list/", difficulty: "Easy" },
          { title: "Reorder List", url: "https://leetcode.com/problems/reorder-list/", difficulty: "Medium" },
          { title: "Palindrome Linked List", url: "https://leetcode.com/problems/palindrome-linked-list/", difficulty: "Easy" },
          { title: "Sort List", url: "https://leetcode.com/problems/sort-list/", difficulty: "Medium" }
        ]
      },
      {
        id: "nth_node_from_end",
        label: "N-th Node from End",
        questions: [
          { title: "Remove Nth Node From End of List", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", difficulty: "Medium" },
          { title: "Delete the Middle Node of a Linked List", url: "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/", difficulty: "Medium" },
          { title: "Swapping Nodes in a Linked List", url: "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/", difficulty: "Medium" },
          { title: "Split Linked List in Parts", url: "https://leetcode.com/problems/split-linked-list-in-parts/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "linked_list",
    label: "Linked List",
    tier: 2,
    dependencies: ["fast_slow_pointers"],
    subpatterns: [
      {
        id: "pointer_manipulation",
        label: "In-place Reversal",
        questions: [
          { title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy" },
          { title: "Reverse Linked List II", url: "https://leetcode.com/problems/reverse-linked-list-ii/", difficulty: "Medium" },
          { title: "Reverse Nodes in k-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", difficulty: "Hard" },
          { title: "Swap Nodes in Pairs", url: "https://leetcode.com/problems/swap-nodes-in-pairs/", difficulty: "Medium" }
        ]
      },
      {
        id: "two_list_merge",
        label: "Merging / Dummy Node",
        questions: [
          { title: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "Easy" },
          { title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard" },
          { title: "Partition List", url: "https://leetcode.com/problems/partition-list/", difficulty: "Medium" },
          { title: "Add Two Numbers", url: "https://leetcode.com/problems/add-two-numbers/", difficulty: "Medium" }
        ]
      },
      {
        id: "structural_modifications",
        label: "Copy / Interleaving",
        questions: [
          { title: "Copy List with Random Pointer", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", difficulty: "Medium" },
          { title: "Rotate List", url: "https://leetcode.com/problems/rotate-list/", difficulty: "Medium" },
          { title: "Odd Even Linked List", url: "https://leetcode.com/problems/odd-even-linked-list/", difficulty: "Medium" },
          { title: "Remove Duplicates from Sorted List II", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "trees",
    label: "Trees",
    tier: 3,
    dependencies: ["stack"],
    subpatterns: [
      {
        id: "dfs_traversals",
        label: "DFS / Recursive Traversals",
        questions: [
          { title: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "Easy" },
          { title: "Invert Binary Tree", url: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "Easy" },
          { title: "Same Tree", url: "https://leetcode.com/problems/same-tree/", difficulty: "Easy" },
          { title: "Subtree of Another Tree", url: "https://leetcode.com/problems/subtree-of-another-tree/", difficulty: "Easy" }
        ]
      },
      {
        id: "bfs_traversals",
        label: "BFS / Level Order Traversals",
        questions: [
          { title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "Medium" },
          { title: "Binary Tree Right Side View", url: "https://leetcode.com/problems/binary-tree-right-side-view/", difficulty: "Medium" },
          { title: "Binary Tree Zigzag Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", difficulty: "Medium" },
          { title: "Populating Next Right Pointers in Each Node", url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/", difficulty: "Medium" }
        ]
      },
      {
        id: "bst_operations",
        label: "Binary Search Tree Operations",
        questions: [
          { title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium" },
          { title: "Lowest Common Ancestor of a Binary Search Tree", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", difficulty: "Easy" },
          { title: "Insert into a Binary Search Tree", url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/", difficulty: "Medium" },
          { title: "Delete Node in a BST", url: "https://leetcode.com/problems/delete-node-in-a-bst/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "heap",
    label: "Heap / Priority Queue",
    tier: 3,
    dependencies: ["binary_search"],
    subpatterns: [
      {
        id: "top_k",
        label: "Top K Elements",
        questions: [
          { title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium" },
          { title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "Medium" },
          { title: "Find K Closest Elements", url: "https://leetcode.com/problems/find-k-closest-elements/", difficulty: "Medium" },
          { title: "Kth Largest Element in a Stream", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", difficulty: "Easy" }
        ]
      },
      {
        id: "two_heaps",
        label: "Two Heaps",
        questions: [
          { title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "Hard" },
          { title: "IPO", url: "https://leetcode.com/problems/ipo/", difficulty: "Hard" },
          { title: "Sliding Window Median", url: "https://leetcode.com/problems/sliding-window-median/", difficulty: "Hard" },
          { title: "Find Right Interval", url: "https://leetcode.com/problems/find-right-interval/", difficulty: "Medium" }
        ]
      },
      {
        id: "merge_k_sorted",
        label: "Merge K Sorted Lists",
        questions: [
          { title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard" },
          { title: "Kth Smallest Element in a Sorted Matrix", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", difficulty: "Medium" },
          { title: "Find K Pairs with Smallest Sums", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/", difficulty: "Medium" },
          { title: "Smallest Range Covering Elements from K Lists", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "backtracking",
    label: "Backtracking",
    tier: 4,
    dependencies: ["trees"],
    subpatterns: [
      {
        id: "permutations_subsets",
        label: "Permutations & Subsets",
        questions: [
          { title: "Subsets", url: "https://leetcode.com/problems/subsets/", difficulty: "Medium" },
          { title: "Permutations", url: "https://leetcode.com/problems/permutations/", difficulty: "Medium" },
          { title: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/", difficulty: "Medium" },
          { title: "Letter Combinations of a Phone Number", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", difficulty: "Medium" }
        ]
      },
      {
        id: "grid_exploration",
        label: "Grid Exploration",
        questions: [
          { title: "Word Search", url: "https://leetcode.com/problems/word-search/", difficulty: "Medium" },
          { title: "N-Queens", url: "https://leetcode.com/problems/n-queens/", difficulty: "Hard" },
          { title: "Sudoku Solver", url: "https://leetcode.com/problems/sudoku-solver/", difficulty: "Hard" },
          { title: "Unique Paths III", url: "https://leetcode.com/problems/unique-paths-iii/", difficulty: "Hard" }
        ]
      },
      {
        id: "partitioning",
        label: "Partitioning / Pruning",
        questions: [
          { title: "Palindrome Partitioning", url: "https://leetcode.com/problems/palindrome-partitioning/", difficulty: "Medium" },
          { title: "Restore IP Addresses", url: "https://leetcode.com/problems/restore-ip-addresses/", difficulty: "Medium" },
          { title: "Matchsticks to Square", url: "https://leetcode.com/problems/matchsticks-to-square/", difficulty: "Medium" },
          { title: "Partition to K Equal Sum Subsets", url: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "graphs",
    label: "Graphs",
    tier: 4,
    dependencies: ["trees", "stack"],
    subpatterns: [
      {
        id: "graph_traversal",
        label: "BFS & DFS Traversals",
        questions: [
          { title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium" },
          { title: "Max Area of Island", url: "https://leetcode.com/problems/max-area-of-island/", difficulty: "Medium" },
          { title: "Clone Graph", url: "https://leetcode.com/problems/clone-graph/", difficulty: "Medium" },
          { title: "Pacific Atlantic Water Flow", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "Medium" }
        ]
      },
      {
        id: "topological_sort",
        label: "Topological Sort",
        questions: [
          { title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", difficulty: "Medium" },
          { title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "Medium" },
          { title: "Minimum Height Trees", url: "https://leetcode.com/problems/minimum-height-trees/", difficulty: "Medium" },
          { title: "Course Schedule IV", url: "https://leetcode.com/problems/course-schedule-iv/", difficulty: "Medium" }
        ]
      },
      {
        id: "shortest_path",
        label: "Shortest Path (Dijkstra)",
        questions: [
          { title: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium" },
          { title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "Medium" },
          { title: "Path with Maximum Probability", url: "https://leetcode.com/problems/path-with-maximum-probability/", difficulty: "Medium" },
          { title: "Swim in Rising Water", url: "https://leetcode.com/problems/swim-in-rising-water/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "greedy",
    label: "Greedy Algorithms",
    tier: 4,
    dependencies: ["heap"],
    subpatterns: [
      {
        id: "interval_scheduling",
        label: "Interval Scheduling",
        questions: [
          { title: "Non-overlapping Intervals", url: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium" },
          { title: "Minimum Number of Arrows to Burst Balloons", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", difficulty: "Medium" },
          { title: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium" },
          { title: "Queue Reconstruction by Height", url: "https://leetcode.com/problems/queue-reconstruction-by-height/", difficulty: "Medium" }
        ]
      },
      {
        id: "greedy_choices",
        label: "Local Optimal Decisions",
        questions: [
          { title: "Jump Game", url: "https://leetcode.com/problems/jump-game/", difficulty: "Medium" },
          { title: "Jump Game II", url: "https://leetcode.com/problems/jump-game-ii/", difficulty: "Medium" },
          { title: "Gas Station", url: "https://leetcode.com/problems/gas-station/", difficulty: "Medium" },
          { title: "Partition Labels", url: "https://leetcode.com/problems/partition-labels/", difficulty: "Medium" }
        ]
      },
      {
        id: "greedy_sorting",
        label: "Sorting-based Greedy",
        questions: [
          { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium" },
          { title: "Two City Scheduling", url: "https://leetcode.com/problems/two-city-scheduling/", difficulty: "Medium" },
          { title: "Boats to Save People", url: "https://leetcode.com/problems/boats-to-save-people/", difficulty: "Medium" },
          { title: "Candy", url: "https://leetcode.com/problems/candy/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "tries",
    label: "Tries",
    tier: 5,
    dependencies: ["backtracking", "trees"],
    subpatterns: [
      {
        id: "standard_trie",
        label: "Standard Trie Operations",
        questions: [
          { title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium" },
          { title: "Design Add and Search Words Data Structure", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", difficulty: "Medium" },
          { title: "Replace Words", url: "https://leetcode.com/problems/replace-words/", difficulty: "Medium" },
          { title: "Search Suggestions System", url: "https://leetcode.com/problems/search-suggestions-system/", difficulty: "Medium" }
        ]
      },
      {
        id: "trie_backtracking",
        label: "Trie + Backtracking",
        questions: [
          { title: "Word Search II", url: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard" },
          { title: "Lexicographical Numbers", url: "https://leetcode.com/problems/lexicographical-numbers/", difficulty: "Medium" },
          { title: "Word Break II", url: "https://leetcode.com/problems/word-break-ii/", difficulty: "Hard" },
          { title: "Concatenated Words", url: "https://leetcode.com/problems/concatenated-words/", difficulty: "Hard" }
        ]
      },
      {
        id: "bitwise_trie",
        label: "Bitwise Trie",
        questions: [
          { title: "Maximum XOR of Two Numbers in an Array", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", difficulty: "Medium" },
          { title: "Maximum XOR with an Element From Array", url: "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/", difficulty: "Hard" },
          { title: "Minimize XOR", url: "https://leetcode.com/problems/minimize-xor/", difficulty: "Medium" },
          { title: "Count Pairs With XOR in a Range", url: "https://leetcode.com/problems/count-pairs-with-xor-in-a-range/", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "merge_intervals",
    label: "Merge Intervals",
    tier: 5,
    dependencies: ["greedy"],
    subpatterns: [
      {
        id: "interval_merging",
        label: "Interval Merging",
        questions: [
          { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium" },
          { title: "Insert Interval", url: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium" },
          { title: "Interval List Intersections", url: "https://leetcode.com/problems/interval-list-intersections/", difficulty: "Medium" },
          { title: "Divide Intervals Into Minimum Number of Groups", url: "https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/", difficulty: "Medium" }
        ]
      },
      {
        id: "interval_queries",
        label: "Interval Queries & Sets",
        questions: [
          { title: "My Calendar I", url: "https://leetcode.com/problems/my-calendar-i/", difficulty: "Medium" },
          { title: "My Calendar II", url: "https://leetcode.com/problems/my-calendar-ii/", difficulty: "Medium" },
          { title: "Range Module", url: "https://leetcode.com/problems/range-module/", difficulty: "Hard" },
          { title: "Car Pooling", url: "https://leetcode.com/problems/car-pooling/", difficulty: "Medium" }
        ]
      },
      {
        id: "two_pointer_intervals",
        label: "Two-pointer Intervals",
        questions: [
          { title: "Find Right Interval", url: "https://leetcode.com/problems/find-right-interval/", difficulty: "Medium" },
          { title: "Remove Covered Intervals", url: "https://leetcode.com/problems/remove-covered-intervals/", difficulty: "Medium" },
          { title: "Minimum Interval to Include Each Query", url: "https://leetcode.com/problems/minimum-interval-to-include-each-query/", difficulty: "Hard" },
          { title: "Meeting Rooms", url: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "dp_1d",
    label: "1D Dynamic Programming",
    tier: 5,
    dependencies: ["kadanes", "prefix_sum", "binary_search"],
    subpatterns: [
      {
        id: "fibonacci_style",
        label: "Fibonacci & Climbers",
        questions: [
          { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy" },
          { title: "Min Cost Climbing Stairs", url: "https://leetcode.com/problems/min-cost-climbing-stairs/", difficulty: "Easy" },
          { title: "N-th Tribonacci Number", url: "https://leetcode.com/problems/n-th-tribonacci-number/", difficulty: "Easy" },
          { title: "House Robber", url: "https://leetcode.com/problems/house-robber/", difficulty: "Medium" }
        ]
      },
      {
        id: "unbounded_knapsack",
        label: "Knapsack & Coin Change",
        questions: [
          { title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "Medium" },
          { title: "Coin Change II", url: "https://leetcode.com/problems/coin-change-ii/", difficulty: "Medium" },
          { title: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "Medium" },
          { title: "Combination Sum IV", url: "https://leetcode.com/problems/combination-sum-iv/", difficulty: "Medium" }
        ]
      },
      {
        id: "lis_style",
        label: "Longest Increasing Subsequence",
        questions: [
          { title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium" },
          { title: "Word Break", url: "https://leetcode.com/problems/word-break/", difficulty: "Medium" },
          { title: "Decode Ways", url: "https://leetcode.com/problems/decode-ways/", difficulty: "Medium" },
          { title: "Perfect Squares", url: "https://leetcode.com/problems/perfect-squares/", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "dp_2d",
    label: "2D Dynamic Programming",
    tier: 6,
    dependencies: ["dp_1d", "graphs", "backtracking"],
    subpatterns: [
      {
        id: "grid_dp",
        label: "Grid Path Problems",
        questions: [
          { title: "Unique Paths", url: "https://leetcode.com/problems/unique-paths/", difficulty: "Medium" },
          { title: "Unique Paths II", url: "https://leetcode.com/problems/unique-paths-ii/", difficulty: "Medium" },
          { title: "Minimum Path Sum", url: "https://leetcode.com/problems/minimum-path-sum/", difficulty: "Medium" },
          { title: "Maximal Square", url: "https://leetcode.com/problems/maximal-square/", difficulty: "Medium" }
        ]
      },
      {
        id: "lcs_style",
        label: "LCS & String Alignment",
        questions: [
          { title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium" },
          { title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard" },
          { title: "Interleaving String", url: "https://leetcode.com/problems/interleaving-string/", difficulty: "Medium" },
          { title: "Distinct Subsequences", url: "https://leetcode.com/problems/distinct-subsequences/", difficulty: "Hard" }
        ]
      },
      {
        id: "stock_intervals",
        label: "Stock & Multi-State Decision",
        questions: [
          { title: "Best Time to Buy and Sell Stock with Cooldown", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", difficulty: "Medium" },
          { title: "Best Time to Buy and Sell Stock with Transaction Fee", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/", difficulty: "Medium" },
          { title: "Best Time to Buy and Sell Stock III", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/", difficulty: "Hard" },
          { title: "Best Time to Buy and Sell Stock IV", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/", difficulty: "Hard" }
        ]
      }
    ]
  }
];

// Ensure module environment compatibility if loaded in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PATTERNS };
}
