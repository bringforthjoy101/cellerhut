import React from 'react'
import StarRatingComponent from 'react-star-rating-component'

const Ratings = ({ feedback }) => {
    return (
        <div className="d-flex align-items-center">
            <p className="mt-1">Star Rating: </p>
            <StarRatingComponent
                name="rate1"
                starCount={5}
                className="ml-2"
                value={feedback.rating}
            //   onStarClick={this.onStarClick.bind(this)}
            />
        </div>
    )
}

export default Ratings
