# poietic

information I need to store:
- drawing board size
- palette
- tags (or tag id's)
:: for each pixel
    - coordinates
    - color (palette index / rgb values)
    - stroke # (multiple with same stroke # = drag. one = click)
    - timestamp? (we could remove this later if we don't need it, I think it would be helpful for making drawing seem more natural)

we can store verbose for now, later we can compress it down to binary

16 bits drawing board width
16 bits drawing board height
8 bits palette id
0 bits tags
:: for each pixel history
    8/16 bits coordinate x (or minimum number of bits based on drawing board)
    8/16 bits coordinate y (or minimum number of bits based on drawing board)
    1 bit (erase or not erase)
    (if not erase) 8 bits palette index / 24 bits color

let's say there's 400 pixels in the history, 100 of which are erase, 20 * 20 board

16 + 16 + 8 + (5 + 5 + 1 + 8) * 300 + (5 + 5  +1) * 100
= 6840 bits
= 855 bytes
= approx. 1kb

if average is 200 pixels, 50 erase, 20 * 20

16 + 16 + 8 + (5 + 5 + 1 + 8) * 150 + (5 + 5  +1) * 50
= 3440 bits
= 430 bytes
= approx 0.5kb

then 2,000 sprites = 1mb
then 2,000,000 sprites = 1gb

wouldn't it be amazing to have a game with over 1,000,000 animated sprites?
you could play the game 500 times and still see new sprites each time.
now creating functionality on everything would be haaard. That's why we need tags.

all depends on how many contributors you can get on crowdsourcing. More likely to end up with around 10,000 - 100,000 sprites than 1,000,000.

if 80% of people contribute 1
and 20% of people contribute 5

you would need 5000 - 6000 contributors to get over 10,000 sprites. Hopefully we can bring the average higher than 2 per person through gamification and rewards. Rewards would be similar to monetary rewards but are gained through participating in the crowdsourcing campaign.

And good luck if even 50% of those 10,000 sprites are any good !
