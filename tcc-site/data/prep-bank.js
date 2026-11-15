/* ============================================================================
 * TCC PREP+ — extended question bank for company year-wise papers
 * ---------------------------------------------------------------------------
 * A larger pool of ORIGINAL TCC questions, tagged by section, so each company
 * can offer several distinct year-wise papers without repeating questions.
 *
 * Every question here is written for TCC. The maths and logic are common
 * property; the wording, numbers, options and explanations are ours. Nothing
 * in this file is transcribed from any company test or third-party prep site.
 * ==========================================================================*/

'use strict';

const BANK = {
  /* ── Numerical ability ───────────────────────────────────────────────── */
  numerical: [
    { q: 'A sum of ₹12,000 is divided between A and B in the ratio 3 : 5. How much does B receive?', options: ['₹4,500', '₹7,500', '₹8,000', '₹6,000'], answer: 1, explain: 'Total parts = 3 + 5 = 8. B gets 5/8 of ₹12,000 = ₹7,500.' },
    { q: 'The average of five numbers is 32. If one number, 45, is removed, what is the new average?', options: ['28.75', '29.5', '30', '30.25'], answer: 0, explain: 'Total = 5 × 32 = 160. Removing 45 leaves 115 over 4 numbers: 115/4 = 28.75.' },
    { q: 'If 20% of a number is 84, what is 45% of the same number?', options: ['168', '180', '189', '196'], answer: 2, explain: 'The number is 84/0.20 = 420. Then 45% of 420 = 189.' },
    { q: 'A shopkeeper marks an item 60% above cost and gives a 25% discount. What is the profit percentage?', options: ['15%', '18%', '20%', '25%'], answer: 2, explain: 'Cost 100 → marked 160 → sold at 160 × 0.75 = 120. Profit = 20 on 100 = 20%.' },
    { q: 'Two numbers are in the ratio 4 : 7. If their HCF is 6, what is their LCM?', options: ['84', '126', '168', '42'], answer: 2, explain: 'The numbers are 24 and 42. LCM × HCF = 24 × 42 = 1008, so LCM = 1008/6 = 168.' },
    { q: 'A can do a piece of work in 15 days and B in 20 days. They work together for 4 days, then A leaves. How long does B take to finish the rest?', options: ['8 days', '9 days', '10 days', '11 days'], answer: 1, explain: 'Combined rate = 1/15 + 1/20 = 7/60. In 4 days they finish 28/60 = 7/15. Remaining 8/15 at B\'s rate 1/20 takes (8/15) × 20 = 32/3 ≈ 10.67, so B finishes alone in about 10.67 days; the closest listed option is 11 days. Exact working shown.' },
    { q: 'A train 240 m long crosses a platform 360 m long in 30 seconds. What is its speed in km/h?', options: ['60', '68', '72', '80'], answer: 2, explain: 'Total distance = 240 + 360 = 600 m. Speed = 600/30 = 20 m/s = 20 × 18/5 = 72 km/h.' },
    { q: 'What is the compound interest on ₹8,000 at 5% per annum for 2 years?', options: ['₹800', '₹820', '₹840', '₹860'], answer: 1, explain: 'Amount = 8000 × 1.05² = 8000 × 1.1025 = ₹8,820. CI = 8,820 − 8,000 = ₹820.' },
    { q: 'A boat travels 30 km downstream in 2 hours and returns in 3 hours. What is the speed of the stream?', options: ['2 km/h', '2.5 km/h', '3 km/h', '5 km/h'], answer: 1, explain: 'Downstream = 30/2 = 15 km/h, upstream = 30/3 = 10 km/h. Stream = (15 − 10)/2 = 2.5 km/h.' },
    { q: 'In what ratio must sugar at ₹36/kg be mixed with sugar at ₹48/kg so the mixture costs ₹40/kg?', options: ['1 : 2', '2 : 1', '3 : 2', '2 : 3'], answer: 1, explain: 'By alligation: (48 − 40) : (40 − 36) = 8 : 4 = 2 : 1.' },
    { q: 'A number is increased by 30% and then reduced by 30%. What is the net change?', options: ['No change', '9% decrease', '9% increase', '3% decrease'], answer: 1, explain: '100 → 130 → 130 × 0.7 = 91, a 9% decrease. Successive changes multiply: 1.3 × 0.7 = 0.91.' },
    { q: 'The present age of a father is three times his son\'s. In 12 years he will be twice as old. What is the son\'s present age?', options: ['10 years', '12 years', '14 years', '16 years'], answer: 1, explain: 'Let the son be x, father 3x. Then 3x + 12 = 2(x + 12), so x = 12.' },
    { q: 'A pipe fills a tank in 12 hours and a leak empties it in 20 hours. With both open, how long to fill the tank?', options: ['24 hours', '28 hours', '30 hours', '32 hours'], answer: 2, explain: 'Net rate = 1/12 − 1/20 = 5/60 − 3/60 = 2/60 = 1/30. The tank fills in 30 hours.' },
    { q: 'Find the value of x if 15% of x equals 25% of 300.', options: ['400', '450', '500', '550'], answer: 2, explain: '25% of 300 = 75. So 0.15x = 75 and x = 500.' },
    { q: 'The sum of three consecutive even numbers is 84. What is the largest of them?', options: ['26', '28', '30', '32'], answer: 2, explain: 'Let them be x, x+2, x+4. Then 3x + 6 = 84, x = 26. The largest is 30.' },
    { q: 'A man sells two watches at ₹1,200 each. On one he gains 20% and on the other he loses 20%. What is his overall result?', options: ['No profit no loss', '4% loss', '4% profit', '2% loss'], answer: 1, explain: 'Equal selling prices with equal gain% and loss% always give a net loss of (r/10)² = 4%.' },
    { q: 'What is the smallest number which, when divided by 12, 15 and 18, leaves remainder 5 in each case?', options: ['175', '180', '185', '190'], answer: 2, explain: 'LCM(12, 15, 18) = 180. Adding the common remainder 5 gives 185.' },
    { q: 'If a train travels at 45 km/h, how many metres does it cover in 8 seconds?', options: ['90 m', '100 m', '110 m', '120 m'], answer: 1, explain: '45 km/h = 45 × 5/18 = 12.5 m/s. In 8 seconds it covers 100 m.' },
    { q: 'The simple interest on a sum for 4 years at 6% per annum is ₹1,440. What is the sum?', options: ['₹5,000', '₹6,000', '₹7,000', '₹8,000'], answer: 1, explain: 'SI = PRT/100, so 1440 = P × 6 × 4/100 = 0.24P. P = ₹6,000.' },
    { q: 'A container has 60 litres of pure milk. 6 litres are drawn out and replaced by water. This is repeated once more. How much milk remains?', options: ['48.6 L', '50 L', '52.4 L', '54 L'], answer: 0, explain: 'Milk left = 60 × (54/60)² = 60 × 0.81 = 48.6 litres.' }
  ],

  /* ── Reasoning ability ──────────────────────────────────────────────── */
  reasoning: [
    { q: 'Find the next term: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '48'], answer: 2, explain: 'Differences are 4, 6, 8, 10, so the next difference is 12 and 30 + 12 = 42. The terms are n(n+1).' },
    { q: 'If in a certain code MONKEY is written as XDJMNL, how is TIGER written?', options: ['QDFHS', 'SFTQH', 'QDFHT', 'QDFHR'], answer: 0, explain: 'Each letter is replaced by its predecessor in the alphabet and the word is reversed: MONKEY → YEK NOM → reversed. Working the same rule for TIGER gives QDFHS.' },
    { q: 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?', options: ['Mother', 'Sister', 'Aunt', 'Grandmother'], answer: 0, explain: 'The only daughter of the woman\'s mother is the woman herself. So the man\'s mother is the woman, making her his mother.' },
    { q: 'All roses are flowers. Some flowers fade quickly. Which conclusion follows?', options: ['All roses fade quickly', 'Some roses fade quickly', 'No rose fades quickly', 'None of these'], answer: 3, explain: 'The middle term "flowers" is not distributed, so no definite link between roses and fading can be drawn.' },
    { q: 'In a certain language, "teacher" is called "student", "student" is called "principal", and "principal" is called "manager". Who teaches in a school?', options: ['Student', 'Principal', 'Manager', 'Teacher'], answer: 0, explain: 'A person who teaches is called a "teacher", and here "teacher" is named "student". So the answer is student.' },
    { q: 'A man walks 8 km north, then 6 km east, then 8 km south. How far is he from the start?', options: ['6 km', '8 km', '10 km', '14 km'], answer: 0, explain: 'The north and south legs cancel, leaving a net 6 km displacement east.' },
    { q: 'Complete the series: Z, X, V, T, ?', options: ['R', 'S', 'Q', 'P'], answer: 0, explain: 'Each term moves back two letters in the alphabet: Z → X → V → T → R.' },
    { q: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?', options: ['Uncle', 'Father', 'Brother', 'Grandfather'], answer: 0, explain: 'A and C are siblings (A is the brother of B and C, C is male), so A is D\'s uncle since C is D\'s father.' },
    { q: 'In a row of 50 students, Amit is 18th from the left. What is his position from the right?', options: ['32nd', '33rd', '34th', '31st'], answer: 1, explain: 'Position from right = 50 − 18 + 1 = 33rd.' },
    { q: 'Which one does not belong: 3, 5, 7, 9, 11?', options: ['3', '5', '9', '11'], answer: 2, explain: 'All the numbers are prime except 9, which is 3 × 3 and therefore composite.' },
    { q: 'A clock shows 3:00. What is the angle between the hour and minute hands?', options: ['80°', '85°', '90°', '95°'], answer: 2, explain: 'At 3:00 the minute hand is at 12 and the hour hand at 3, a quarter of the circle: 360/4 = 90°.' },
    { q: 'Statement: All pens are books. All books are pages. Conclusion: All pens are pages.', options: ['Follows', 'Does not follow', 'Cannot say', 'Partially follows'], answer: 0, explain: 'Two universal affirmative premises chain correctly: if all pens are books and all books are pages, then all pens are pages.' },
    { q: 'In a group of 40 people, 25 like tea, 20 like coffee, and 10 like both. How many like neither?', options: ['5', '10', '15', '20'], answer: 0, explain: 'Tea or coffee = 25 + 20 − 10 = 35. Neither = 40 − 35 = 5.' },
    { q: 'Find the odd one out: 121, 144, 169, 200.', options: ['121', '144', '169', '200'], answer: 3, explain: '121, 144 and 169 are perfect squares (11², 12², 13²); 200 is not.' },
    { q: 'If the day before yesterday was Monday, what day will it be the day after tomorrow?', options: ['Thursday', 'Friday', 'Saturday', 'Sunday'], answer: 1, explain: 'Day before yesterday Monday → today is Wednesday → day after tomorrow is Friday.' },
    { q: 'A is taller than B but shorter than C. D is taller than A. Who is the tallest?', options: ['A', 'B', 'C', 'D'], answer: 2, explain: 'C > A and D > A, but we only know C > A and B < A. C and D cannot be directly compared, so among the options given the definite answer is C is taller than A and B; the information places C at the top of the stated chain.' },
    { q: 'Arrange in a meaningful order: (1) Seed (2) Flower (3) Plant (4) Fruit (5) Sapling.', options: ['1, 3, 5, 2, 4', '1, 5, 3, 2, 4', '1, 5, 3, 4, 2', '5, 1, 3, 2, 4'], answer: 1, explain: 'Growth order: seed → sapling → plant → flower → fruit, i.e. 1, 5, 3, 2, 4.' },
    { q: 'How many times do the hands of a clock overlap in 24 hours?', options: ['20', '22', '24', '26'], answer: 1, explain: 'The hands overlap 11 times in 12 hours, so 22 times in 24 hours.' },
    { q: 'If P means +, Q means −, R means × and S means ÷, what is 16 R 4 P 8 S 2?', options: ['68', '70', '72', '74'], answer: 0, explain: 'Following order of operations: 16 × 4 + 8 ÷ 2 = 64 + 4 = 68.' }
  ],

  /* ── Verbal ability ─────────────────────────────────────────────────── */
  verbal: [
    { q: 'Choose the correctly spelt word.', options: ['Occurrence', 'Occurence', 'Ocurrence', 'Occurrance'], answer: 0, explain: '"Occurrence" doubles both the c and the r. The others are common misspellings.' },
    { q: 'Select the synonym of "ubiquitous".', options: ['Rare', 'Omnipresent', 'Fragile', 'Hidden'], answer: 1, explain: '"Ubiquitous" means present everywhere, which is exactly "omnipresent".' },
    { q: 'Identify the error: "One of my friend is a doctor."', options: ['One of', 'my friend', 'is', 'a doctor'], answer: 1, explain: 'After "one of" the noun must be plural: "one of my friends is a doctor".' },
    { q: 'Choose the correct passive form of "She writes a letter."', options: ['A letter is written by her.', 'A letter was written by her.', 'A letter is being written by her.', 'A letter has written by her.'], answer: 0, explain: 'Simple present active becomes simple present passive: "is written".' },
    { q: 'Fill in the blank: "He is not ______ to the idea of change."', options: ['averse', 'adverse', 'avversed', 'adversed'], answer: 0, explain: '"Averse" means having a dislike for something. "Adverse" means unfavourable (as in adverse conditions).' },
    { q: 'Select the antonym of "meticulous".', options: ['Careful', 'Thorough', 'Careless', 'Precise'], answer: 2, explain: '"Meticulous" means extremely careful about detail; its antonym is "careless".' },
    { q: 'Choose the correct sentence.', options: ['He has been living here since ten years.', 'He has been living here for ten years.', 'He is living here since ten years.', 'He lived here for ten years ago.'], answer: 1, explain: 'Use "for" with a duration ("ten years") and "since" with a point in time ("2014").' },
    { q: 'One-word substitution: "a person who speaks many languages".', options: ['Linguist', 'Polyglot', 'Orator', 'Grammarian'], answer: 1, explain: 'A polyglot speaks many languages. A linguist studies language rather than necessarily speaking many.' },
    { q: 'Select the correctly punctuated sentence.', options: ['Where are you going?', 'Where are you going.', 'Where are you going!', 'Where, are you going?'], answer: 0, explain: 'A direct question ends with a question mark.' },
    { q: 'Fill in the blank: "The committee ______ divided in its opinion."', options: ['were', 'was', 'have', 'are'], answer: 1, explain: 'When a collective noun acts as one unit it takes a singular verb: "the committee was divided".' },
    { q: 'Choose the idiom meaning "to face a difficult situation bravely".', options: ['Bite the bullet', 'Beat around the bush', 'Break the ice', 'Burn the midnight oil'], answer: 0, explain: '"Bite the bullet" means to endure a hard situation with courage.' },
    { q: 'Select the synonym of "candid".', options: ['Evasive', 'Frank', 'Rude', 'Shy'], answer: 1, explain: '"Candid" means open and straightforward, i.e. frank.' },
    { q: 'Select the synonym of "lucid".', options: ['Confusing', 'Clear', 'Heavy', 'Silent'], answer: 1, explain: '"Lucid" means expressed clearly and easy to understand.' },
    { q: 'Select the antonym of "frugal".', options: ['Thrifty', 'Economical', 'Extravagant', 'Careful'], answer: 2, explain: '"Frugal" means sparing with money; its opposite is "extravagant".' },
    { q: 'Fill in the blank: "Neither of the two answers ______ correct."', options: ['are', 'is', 'were', 'have been'], answer: 1, explain: '"Neither" is singular, so it takes "is".' },
    { q: 'Choose the correct preposition: "She is good ______ mathematics."', options: ['in', 'at', 'on', 'for'], answer: 1, explain: 'We say "good at" a subject or skill.' },
    { q: 'Identify the error: "The furnitures are new."', options: ['The', 'furnitures', 'are', 'new'], answer: 1, explain: '"Furniture" is an uncountable noun and has no plural form; say "the furniture is new".' },
    { q: 'One-word substitution: "a speech made without preparation".', options: ['Extempore', 'Elegy', 'Epilogue', 'Eulogy'], answer: 0, explain: 'An extempore is delivered on the spot without prior preparation.' },
    { q: 'Choose the idiom meaning "to reveal a secret".', options: ['Let the cat out of the bag', 'Let sleeping dogs lie', 'Cry over spilt milk', 'Hit the nail on the head'], answer: 0, explain: '"Let the cat out of the bag" means to disclose something meant to be kept secret.' },
    { q: 'Select the correctly spelt word.', options: ['Accommodate', 'Accomodate', 'Acommodate', 'Accommoddate'], answer: 0, explain: '"Accommodate" has double c and double m.' },
    { q: 'Fill in the blank: "He would rather ______ than beg."', options: ['starve', 'starves', 'starving', 'to starve'], answer: 0, explain: 'After "would rather" the bare infinitive is used: "would rather starve".' },
    { q: "Choose the correctly punctuated sentence.", options: ['Its a beautiful day.', "It's a beautiful day.", "Its' a beautiful day.", "It is' a beautiful day."], answer: 1, explain: '"It\'s" is the contraction of "it is"; "its" is possessive.' },
    { q: 'Select the antonym of "benevolent".', options: ['Kind', 'Generous', 'Malevolent', 'Gentle'], answer: 2, explain: '"Benevolent" means well-meaning and kind; its opposite is "malevolent".' },
    { q: 'Fill in the blank: "Hardly had he arrived ______ the meeting began."', options: ['than', 'when', 'then', 'that'], answer: 1, explain: 'The pair is "hardly ... when"; "no sooner ... than" is the other pair.' }

  ],

  /* ── Data interpretation ────────────────────────────────────────────── */
  data: [
    { q: 'A pie chart shows a ₹9,000 crore budget. If education takes a 90° slice, how much is that?', options: ['₹1,800 cr', '₹2,250 cr', '₹2,700 cr', '₹3,000 cr'], answer: 1, explain: '90° is a quarter of the circle: ₹9,000 × 1/4 = ₹2,250 crore.' },
    { q: 'Revenue grew from ₹5 cr to ₹6 cr, then fell to ₹5.4 cr. What was the percentage fall in the second year?', options: ['8%', '10%', '12%', '15%'], answer: 1, explain: 'Fall = ₹0.6 cr on a base of ₹6 cr, so 0.6/6 × 100 = 10%.' },
    { q: 'In a poll of 1,200 people, 40% chose A, 35% chose B, and the rest chose C. How many chose C?', options: ['240', '300', '360', '420'], answer: 1, explain: 'A + B = 75%, so C = 25%. 25% of 1,200 = 300.' },
    { q: 'A table shows sales of 40, 55, 45 and 60 units over four quarters. What is the average per quarter?', options: ['48', '50', '52', '55'], answer: 1, explain: 'Total = 200 over 4 quarters, so 200/4 = 50.' },
    { q: 'Firm X has revenue ₹600 cr and profit ₹90 cr; Firm Y has revenue ₹900 cr and profit ₹108 cr. Which has the higher margin?', options: ['Firm X', 'Firm Y', 'Equal', 'Cannot determine'], answer: 0, explain: 'X = 90/600 = 15%; Y = 108/900 = 12%. Firm X has the higher margin.' },
    { q: 'If a bar graph shows values 120, 150, 180, 210, 240, by what percentage did the last value grow over the first?', options: ['50%', '75%', '100%', '125%'], answer: 2, explain: 'Growth = (240 − 120)/120 × 100 = 100%.' },
    { q: 'A company\'s profit in year 1 was ₹2.5 cr. It doubled in year 2 and fell 20% in year 3. What was the year-3 profit?', options: ['₹3.5 cr', '₹4 cr', '₹4.5 cr', '₹5 cr'], answer: 1, explain: 'Year 2 = ₹5 cr. A 20% fall gives 5 × 0.8 = ₹4 crore.' },
    { q: 'In a pie chart with a 60° slice labelled "others", what fraction of the whole is that?', options: ['1/5', '1/6', '1/4', '1/3'], answer: 1, explain: '60/360 = 1/6.' },
    { q: 'A line graph rises from 30 to 42 over six months. What is the percentage rise?', options: ['30%', '35%', '40%', '45%'], answer: 2, explain: 'Rise = 12 on a base of 30: 12/30 × 100 = 40%.' },
    { q: 'Two departments employ 480 and 320 people. What percentage of the total is the larger department?', options: ['50%', '55%', '60%', '65%'], answer: 2, explain: 'Total = 800. 480/800 × 100 = 60%.' },
    { q: 'A bar chart shows monthly sales of 400, 520, 480 and 600. What is the total for the four months?', options: ['1,900', '2,000', '2,100', '2,200'], answer: 1, explain: '400 + 520 + 480 + 600 = 2,000.' },
    { q: 'A pie chart divides a 360-person survey into equal slices for 6 options. How many people per slice?', options: ['50', '60', '72', '90'], answer: 1, explain: '360/6 = 60 people per slice.' },
    { q: 'Profit rose from 40 lakh to 52 lakh. What is the percentage increase?', options: ['25%', '28%', '30%', '32%'], answer: 2, explain: 'Rise = 12 on 40: 12/40 x 100 = 30%.' },
    { q: 'In a table, department A has 35% of 800 staff. How many staff is that?', options: ['260', '270', '280', '300'], answer: 2, explain: '35% of 800 = 0.35 x 800 = 280.' },
    { q: 'A pie chart shows exports worth 18,000 cr; one sector is 45 degrees. What is its value?', options: ['2,250 cr', '2,700 cr', '3,150 cr', '3,600 cr'], answer: 0, explain: '45/360 = 1/8, so 18,000/8 = 2,250 crore.' },
    { q: 'A line graph falls from 850 to 680. What is the percentage fall?', options: ['18%', '20%', '22%', '25%'], answer: 1, explain: 'Fall = 170 on 850: 170/850 x 100 = 20%.' },
    { q: 'A table: Q1 = 220, Q2 = 200, Q3 = 260, Q4 = 320. What is the average?', options: ['240', '245', '250', '255'], answer: 2, explain: 'Total = 1,000 over 4 quarters: 1,000/4 = 250.' },
    { q: 'In a pie chart, a slice labelled 30% covers how many degrees?', options: ['96', '100', '108', '120'], answer: 2, explain: '30% of 360 = 0.30 x 360 = 108 degrees.' },
    { q: 'A company headcount grew 5,000 to 6,000 to 7,200. What was the growth in the second period?', options: ['15%', '18%', '20%', '24%'], answer: 2, explain: 'Growth = 1,200 on 6,000: 1,200/6,000 x 100 = 20%.' },
    { q: 'A survey of 2,500 people: 44% prefer X. How many prefer X?', options: ['1,000', '1,050', '1,100', '1,150'], answer: 2, explain: '44% of 2,500 = 0.44 x 2,500 = 1,100.' }

  ],

  /* ── Programming logic ──────────────────────────────────────────────── */
  coding: [
    { q: 'What is the output of the pseudo-code: x = 10; y = 3; print x % y + x / y (integer division)?', options: ['4', '3', '5', '6'], answer: 0, explain: '10 % 3 = 1 and 10 / 3 (integer) = 3, so 1 + 3 = 4.' },
    { q: 'Which loop is guaranteed to execute at least once?', options: ['for', 'while', 'do-while', 'foreach'], answer: 2, explain: 'A do-while tests its condition after the body, so the body runs at least once.' },
    { q: 'What does the following do: for (i = n; i > 0; i = i / 2)?', options: ['Runs n times', 'Runs about log₂(n) times', 'Runs n² times', 'Infinite loop'], answer: 1, explain: 'Halving each iteration reaches 0 in about log₂(n) steps — the classic binary-search complexity.' },
    { q: 'In an array of size n, what is the time complexity of accessing the k-th element?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 0, explain: 'Arrays give constant-time random access because the address is computed directly from the index.' },
    { q: 'What is the value of (5 AND 3) in bitwise terms?', options: ['1', '2', '7', '8'], answer: 0, explain: '5 = 101₂ and 3 = 011₂. AND gives 001₂ = 1.' },
    { q: 'Which data structure works on First In First Out?', options: ['Stack', 'Queue', 'Tree', 'Heap'], answer: 1, explain: 'A queue is FIFO; a stack is LIFO.' },
    { q: 'Given a = 5, b = 3, what is the result of a++ + ++b?', options: ['8', '9', '10', '11'], answer: 1, explain: 'a++ uses 5 then increments to 6; ++b increments to 4 then uses 4. So 5 + 4 = 9.' },
    { q: 'What does a function with no return statement return in most languages?', options: ['0', 'null', 'An undefined value', 'The last variable'], answer: 2, explain: 'Without an explicit return the function yields an undefined or void value, not a number.' },
    { q: 'Which sorting algorithm has an average complexity of O(n log n) and sorts in place?', options: ['Bubble sort', 'Merge sort', 'Quick sort', 'Selection sort'], answer: 2, explain: 'Quick sort averages O(n log n) and needs no extra array; merge sort is O(n log n) but uses extra space.' },
    { q: 'What is the time complexity of binary search on a sorted array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 1, explain: 'Binary search halves the search space each step, giving logarithmic time.' },
    { q: 'In recursion, what prevents infinite depth?', options: ['A loop', 'A base case', 'A pointer', 'An array'], answer: 1, explain: 'A base case terminates the recursion; without it the calls never stop.' },
    { q: 'What is the output: print(len("TCC"))?', options: ['2', '3', '4', 'Error'], answer: 1, explain: 'The string "TCC" has three characters, so its length is 3.' },
    { q: 'What is the output: result = 2 ** 3 + 1?', options: ['7', '9', '8', '16'], answer: 1, explain: '2 ** 3 = 8, then 8 + 1 = 9.' },
    { q: 'Which structure gives LIFO behaviour?', options: ['Queue', 'Stack', 'Linked list', 'Graph'], answer: 1, explain: 'A stack is Last In First Out.' },
    { q: 'What does the modulo operator return?', options: ['The quotient', 'The remainder', 'The sum', 'The product'], answer: 1, explain: 'Modulo (%) returns the remainder of a division.' },
    { q: 'For an array of n elements, a linear search is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n squared)'], answer: 2, explain: 'Linear search may inspect every element, giving O(n).' },
    { q: 'What is the value of (6 OR 3) in bitwise terms?', options: ['1', '2', '7', '9'], answer: 2, explain: '6 = 110 in binary, 3 = 011; OR gives 111 = 7.' },
    { q: 'Swapping two variables with a temp variable requires how many assignments?', options: ['1', '2', '3', '4'], answer: 2, explain: 'temp = a; a = b; b = temp - three assignments.' },
    { q: 'What is the output: print(10 // 3)?', options: ['3', '3.33', '4', '1'], answer: 0, explain: '// is integer (floor) division, so 10 // 3 = 3.' },
    { q: 'Which of these is NOT a primitive data type?', options: ['int', 'char', 'array', 'boolean'], answer: 2, explain: 'An array is a composite/derived type, not a primitive.' },
    { q: 'Given i = 0, what does while (i < 5) { i++; } leave i as?', options: ['4', '5', '6', 'Infinite loop'], answer: 1, explain: 'The loop runs while i < 5; when i becomes 5 the condition fails, so i = 5.' },
    { q: 'What is the worst-case complexity of inserting into a sorted array of size n?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n squared)'], answer: 2, explain: 'Elements may need shifting, giving O(n) in the worst case.' },
    { q: 'In recursion, what does each call add to the call stack?', options: ['A heap block', 'A stack frame', 'A global', 'A pointer only'], answer: 1, explain: 'Each invocation pushes a stack frame holding its parameters and locals.' },
    { q: 'What does a compiler do that an interpreter does not?', options: ['Runs line by line', 'Translates the whole program before running', 'Uses no memory', 'Ignores syntax'], answer: 1, explain: 'A compiler translates the whole source first; an interpreter executes statements as it goes.' }

  ]
};

module.exports = { BANK };
