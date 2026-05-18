# Barber Ranking and Reputation System

## Database Schema

Ratings are stored in the `reviews` collection through `src/models/Review.ts`.

```ts
{
  userId: ObjectId,      // client_id
  barberId: ObjectId,    // barber_id
  bookingId: ObjectId,   // booking_id, unique
  rate: number,          // rating_value, 1-5
  comment: string,       // review, optional
  createdAt: Date,       // timestamp
  updatedAt: Date
}
```

Indexes:

```ts
{ barberId: 1, createdAt: -1 }
{ userId: 1, barberId: 1, createdAt: -1 }
{ bookingId: 1 }, unique
```

The unique `bookingId` index enforces one rating per completed booking. Existing deployments that previously created a unique `{ userId, barberId }` index should drop that legacy index before allowing repeat reviews from the same client after separate bookings.

## Rating API

`POST /api/reviews`

```json
{
  "barberId": "65f...",
  "bookingId": "65f...",
  "ratingValue": 5,
  "review": "Clean fade and excellent timing."
}
```

Legacy request keys `rate` and `comment` are still accepted. Only authenticated clients can review, and the booking must belong to that client, match the barber, and be `completed`.

`GET /api/reviews?barberId=65f...&limit=20`

Returns recent reviews plus average rating and review count.

## Reputation Engine

`BarberReputationEngine` lives in `src/lib/reputation/BarberReputationEngine.ts`.

It uses a 0-5 score:

```text
ReputationScore =
(AdjustedAverageRating * 0.7) +
(CompletedJobsScore * 0.2) +
(ConsistencyScore * 0.1) -
CancellationPenalty +
RecentPerformanceBoost
```

The adjusted average rating uses Bayesian weighting against a baseline rating, so a barber with 5.0 from 2 reviews does not automatically outrank a barber with 4.9 from 300 reviews.

Recognition badges require at least 5 reviews:

- Top Rated Barber
- Elite Barber
- Most Trusted Barber

## Leaderboard API

`GET /api/barbers/leaderboard?period=all-time&limit=10`

`GET /api/barbers/leaderboard?period=monthly&limit=10`

Example response:

```json
{
  "period": "all-time",
  "generatedAt": "2026-05-18T10:00:00.000Z",
  "minimumReviewsForRecognition": 5,
  "leaderboard": [
    {
      "rank": 1,
      "barberId": "65f...",
      "name": "Ayo Martins",
      "reputationScore": 4.76,
      "averageRating": 4.9,
      "reviewCount": 300,
      "completedJobs": 418,
      "cancellationRate": 0.01,
      "badges": ["Top Rated Barber", "Elite Barber", "Most Trusted Barber"],
      "location": "Lagos, Nigeria",
      "bookable": true
    }
  ]
}
```

## Scaling Notes

The current implementation calculates rankings from indexed `reviews` and `bookings` aggregations for real-time freshness. If traffic grows, the same engine can be reused by a scheduled worker to materialize daily or monthly reputation snapshots without changing the scoring contract.
