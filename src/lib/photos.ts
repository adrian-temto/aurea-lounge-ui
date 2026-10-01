import avocadoToast from "@/assets/food/avocado-toast-egg-arugula.jpg";
import ciabatta from "@/assets/food/ciabatta-tomato-mozzarella.jpg";
import tagliatelle from "@/assets/food/tagliatelle-burrata-truffle.jpg";
import cheesecake from "@/assets/food/pistachio-cheesecake.jpg";
import porridge from "@/assets/food/berry-porridge-bowl.jpg";
import burrata from "@/assets/food/burrata-rocket-salad.jpg";
import chickenSalad from "@/assets/food/chicken-salad.jpg";
import bagel from "@/assets/food/chicken-avocado-bagel.jpg";
import poachedToast from "@/assets/food/avocado-toast-poached-egg.jpg";
import pancakes from "@/assets/food/mini-pancakes-berries.jpg";
import flamVeg from "@/assets/food/flammkuchen-vegetable.jpg";
import flamHam from "@/assets/food/flammkuchen-ham-rocket.jpg";
import penne from "@/assets/food/penne-pumpkin-mushroom.jpg";
import salmon from "@/assets/food/salmon-asparagus-hollandaise.jpg";
import baguette from "@/assets/food/baguette-avocado-chicken.jpg";
import buddha from "@/assets/food/buddha-bowl-quinoa-broccoli.jpg";
import facade from "@/assets/events/facade-aurea-lounge-sign.jpg";
import chalkboard from "@/assets/events/opening-chalkboard-sign.jpg";
import canapes from "@/assets/events/bar-canape-display-lilies.jpg";
import loungePortrait from "@/assets/lounge-portrait.jpg";
import atmosphere from "@/assets/events/facade-sign-balloons.jpg";
import drinkOnIce from "@/assets/lounge/drink-on-ice-aurea-screen.jpg";
import icedCoffee from "@/assets/lounge/iced-coffee-aurea-screen.jpg";
import coffeeBar from "@/assets/lounge/coffee-bar-menu-boards.jpg";
import espressoMachine from "@/assets/lounge/espresso-machine.jpg";

export {
  avocadoToast,
  ciabatta,
  tagliatelle,
  cheesecake,
  porridge,
  burrata,
  chickenSalad,
  bagel,
  poachedToast,
  pancakes,
  flamVeg,
  flamHam,
  penne,
  salmon,
  baguette,
  buddha,
  facade,
  chalkboard,
  canapes,
  loungePortrait,
  atmosphere,
};

/** Photos used elsewhere on the home page (day chapters, atmosphere), in gallery order. */
export const FEATURED_FOOD = [avocadoToast, ciabatta, tagliatelle, cheesecake, porridge, burrata];

/** The rest of the kitchen photos; captions are t.kitchen.dishes in the same order. */
export const KITCHEN_PHOTOS = [
  chickenSalad,
  bagel,
  poachedToast,
  pancakes,
  flamVeg,
  flamHam,
  penne,
  salmon,
  baguette,
  buddha,
];

/** Opening evening (no photos of people), 640 px wide; alt texts are t.opening.alts in the same order. */
export const OPENING_PHOTOS = [facade, chalkboard, canapes];

/** The lounge and bar, for the gallery; alt texts are t.pages.gallery.loungeAlts in the same order. */
export const LOUNGE_PHOTOS = [drinkOnIce, icedCoffee, coffeeBar, espressoMachine];
