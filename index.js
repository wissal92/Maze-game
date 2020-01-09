const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 14;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
    Bodies.rectangle(width /2 , 0, width, 10, {isStatic: true}),
    Bodies.rectangle(width /2, height, width, 10, {isStatic: true}),
    Bodies.rectangle(0, height/2, 10, height, {isStatic: true}),
    Bodies.rectangle(width, height/10, 4, height, {isStatic: true})
];
World.add(world, walls);

//Random Shapes
// for(let i = 0; i < 50; i++){
//    if(Math.random() > 0.5){
//    World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50))
//    } else {
//        World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, 35, 35))
//    }
// }

//Maze generation
const shuffle = arr => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false))
const verticals =  Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
   //if the cell is vistied we just return:
   if(grid[row][column]){
       return;
   }

   //Mark the cell as being visited:
   grid[row][column] = true;

   //Assemble randomly the list of neighbors:
   const neighbors = shuffle([
       [row - 1, column, 'up'],
       [row , column + 1, 'right'],
       [row + 1, column, 'down'],
       [row , column - 1, 'left']
   ]);
   
   //for each neighbor:
   for(let neighbor of neighbors){
       const [nextRow, nextColumn, direction] = neighbor;

       //see if the neighbor is out of bounds
       if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
           continue;
       }

       //if we have visited that neighbor, continue to the next neighbor
       if(grid[nextRow][nextColumn]){
           continue;
       }

       //Remove a wall from either horizontals or verticals:
       if(direction === 'left'){
           verticals[row][column - 1] = true;
       } else if(direction === 'right'){
           verticals[row][column] = true;
       } else if(direction === 'up'){
           horizontals[row - 1][column] = true;
       } else if (direction === 'down'){
           horizontals[row][column] = true;
       }

       stepThroughCell(nextRow, nextColumn)
   }
}

stepThroughCell(startRow, startColumn)

//Drawing our cells in our canvas

horizontals.forEach((row, rowIndex) => {
   row.forEach((open, columnIndex) => {
       if(open){
           return;
       }

       const wall = Bodies.rectangle(
           columnIndex * unitLengthX + unitLengthX / 2,
           rowIndex * unitLengthY + unitLengthY,
           unitLengthX,
           5,
           {   
               label: 'wall',
               isStatic: true,
               render: {
                   fillStyle: '#f1f1f1'
               }
           }
       );
       World.add(world, wall)
   });
});

verticals.forEach((row, rowIndex) => {
   row.forEach((open, columnIndex) => {
       if(open){
           return;
       }

       const wall = Bodies.rectangle(
           columnIndex * unitLengthX + unitLengthX,
           rowIndex * unitLengthY + unitLengthY / 2,
           5,
           unitLengthY,
           {   
               label: 'wall',
               isStatic: true,
               render: {
                fillStyle: '#f1f1f1'
            }
           }
       );
       World.add(world, wall)
   });
});

//Create our goal:
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal)

//Create Playing ball:
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: 'ball',
    render: {
        fillStyle: 'red'
    }
});
World.add(world, ball);

//moving the ball:
document.addEventListener('keydown', e =>{
    const{x, y} = ball.velocity;
  
    if(e.keyCode === 87){
        Body.setVelocity(ball, {x, y: y - 5});
    }
    if(e.keyCode === 68){
        Body.setVelocity(ball, {x: x + 5, y});
    }
    if(e.keyCode === 83){
        Body.setVelocity(ball, {x, y: y + 5});
    }
    if(e.keyCode === 65){
        Body.setVelocity(ball, {x: x - 5, y});
    }
})

//Win condition
Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach((collision) => {
       const labels = ['ball', 'goal']

      if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
          //create an animation to tell the user that he has won the game:
          document.querySelector('.winner').classList.remove('hidden');
          world.gravity.y = 1;
          world.bodies.forEach(body => {
              if(body.label === 'wall'){
                  Body.setStatic(body, false)
              }
          })
      }
    });
});
