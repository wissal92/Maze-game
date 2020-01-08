const {Engine, Render, Runner, World, Bodies, Body} = Matter;

const cells = 16;
const width = 600;
const height = 600;

const unitLength = width / cells;

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

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false))
const verticals =  Array(cells).fill(null).map(() => Array(cells - 1).fill(false));
const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

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
       if(nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells){
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
           columnIndex * unitLength + unitLength / 2,
           rowIndex * unitLength + unitLength,
           unitLength,
           5,
           {
               isStatic: true
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
           columnIndex * unitLength + unitLength,
           rowIndex * unitLength + unitLength / 2,
           5,
           unitLength,
           {
               isStatic: true
           }
       );
       World.add(world, wall)
   });
});

//Create our goal:
const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.7,
    unitLength * 0.7,
    {
        isStatic: true
    }
);
World.add(world, goal)

//Create Playing ball:
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4);
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
