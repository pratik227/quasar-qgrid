function onDragOver(event) {
  event.preventDefault();
}
Now, we can add ondragover to our dropzone element in index.html:

index.html
<div class="example-parent">
  <div class="example-origin">
    <div
      id="draggable-1"
      class="example-draggable"
      draggable="true"
      ondragstart="onDragStart(event);"
    >
      draggable
    </div>
  </div>

  <div
    class="example-dropzone"
    ondragover="onDragOver(event);"
  >
    dropzone
  </div>
</div>
At this point, we still have not written code handle the actual dropping. The final event handler fired in this sequence is ondrop.

Let’s revisit our script.js file and create a new function.

We can reference the data we saved earlier with dataTransfer object’s setData method. We will use dataTransfer object’s getData method. The data we set was the id, so that’s what will be returned to us:

script.js
function onDrop(event) {
  const id = event
    .dataTransfer
    .getData('text');
}
Select our draggable element with the id we retrieved:

script.js
function onDrop(event) {
  // ...

  const draggableElement = document.getElementById(id);
}
Select our dropzone element:

script.js
function onDrop(event) {
  // ...

  const dropzone = event.target;
}
Append our draggable element to the dropzone:

script.js
function onDrop(event) {
  // ...

  dropzone.appendChild(draggableElement);
}
Reset our dataTransfer object:

script.js
function onDrop(event) {
  // ...

  event
    .dataTransfer
    .clearData();
}
Now, we can add ondrop to our dropzone element in index.html:

index.html
<div class="example-parent">
  <div class="example-origin">
    <div
      id="draggable-1"
      class="example-draggable"
      draggable="true"
      ondragstart="onDragStart(event);"
    >
      draggable
    </div>
  </div>

  <div
    class="example-dropzone"
    ondragover="onDragOver(event);"
    ondrop="onDrop(event);"
  >
    dropzone
  </div>
</div>
