import redCar from "../assets/sunshine-hatch.png";
import cabrioletCar from "../assets/luxury-cabriolet.jpg";

const carList = [
  {
    id: 1,
    name: "Kia Sunshine Hatch",
    year: "2023",
    brand: "Kia/Huyndai",
    type: "Hatchback",
    available: true,
    reserved: false,
    price: 204,
    description: "Bright, fun, and compact for city driving.",
    image: redCar
  },
  {
    id: 2,
    name: "Cabriolet Sporty",
    year: "2022",
    brand: "Mazda",
    type: "Convertible",
    available: false,
    reserved: false,
    price: 229,
    description: "Sleek and powerful convertible experience.",
    image: cabrioletCar
  },
  {
    id: 3,
    name: "Kia Sunshine Hatch",
    year: "2023",
    brand: "Kia/Huyndai",
    type: "Hatchback",
    available: true,
    reserved: true,
    price: 204,
    description: "Reserved version preview.",
    image: redCar
  }
];

export default carList;
