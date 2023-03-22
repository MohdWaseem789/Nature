import axios from 'axios';
import Stripe from 'stripe';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51MH2QOSDn6uLTqc7Hb306KkRNBvtHGaoN3AWYPeLuot0OMOQqP4CF1QTQbrhkdB5LQaoqggsvjDKc0JBVmAI6FqS00Muneh5Te'
);

export const bookTour = async (tourId) => {
  // 1) Get checkout session from api
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
