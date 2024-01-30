export type Slide = {
  image: string;
  maintext: string;
  detail: string;
};

export const slides: Slide[] = [
  {
    image: '',
    maintext: 'Welcome to Blow Your Face Off',
    detail: 'an online game of **Telephone Pictionary**',
  },
  {
    image: '',
    maintext: 'As expected, this plays like both **Telephone** and **Pictionary**',
    detail: 'Like Telephone, a message is passed from player to player. Like Pictionary, players will both draw and guess pictures',
  },
  {
    image: '',
    maintext: 'At the beginning of the game, all players write a "prompt"',
    detail: "This can be any word phrase or sentence, just be mindful of your fellow players' tastes",
  },
  {
    image: '',
    maintext: 'Next, these "prompts" are passed around to the next player to be drawn',
    detail: 'You will recieve a prompt that another player wrote. In this round, you will draw a picture to represent the prompt you recieved',
  },
  {
    image: '',
    maintext: 'These images are then passed to the next player to be described',
    detail: 'This time, you will recieve an image *without* the original prompt. You will then describe what this image is using your words',
  },
  {
    image: '',
    maintext: 'Gameplay continues with this pattern',
    detail: "Rounds alternate between describing the previous player's image and drawing the previous player's description",
  },
  {
    image: '',
    maintext: 'The game is over when the messages have made it through all players',
    detail: 'The number of rounds is the same as the number of players',
  },
  {
    image: '',
    maintext: 'After the game is done, everyone can view the message chains together',
    detail: "Enjoy the hilarity and confusion of your fellow players' drawings and guesses",
  },
  {
    image: '',
    maintext: 'Have fun!',
    detail: "While you should give an honest attempt to pass the messages, don't worry too much about your message making it to the end intact. The point of the game is *fun*",
  },
  {
    image: '',
    maintext: 'Questions?',
    detail: `We have some answers. For questions about technical issues, you can visit the [Knowlege Base](https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base). A more general gameplay FAQ is in the works`,
  },
];
