# Website Performance Optimization portfolio project

Challenge accepted!

## Optimize to achieve a score > 90
The following changes were done in the index.html to earn a score > 90

- Gulp was used for minification of CSS, JavaScript and other optimizations
- Images were further compressed using http://compressnow.com/
- Set the JavaScript to load asynchronously
- Removed render-blocking JavaScript and CSS
- Inlined CSS for style.css
- Set the Media Query for print.css to be media=print
- Handled the web font

## Optimize to achieve 60 fps

On a high level, the following things were done

- variable assignments were pulled out of for loops
- transform was used 
- requestAnimationFrame was used
- reduced the number of pizzas