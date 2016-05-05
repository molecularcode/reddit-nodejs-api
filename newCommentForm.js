var newCommentForm = `
<form action="/newcomment" method="POST">
  <h2>Leave a comment</h2>
  <div>
    <textarea required name="comment" placeholder="Write your comment" style="rows: '10' cols: '100'; padding: 10px;"></textarea>
  </div>
  <button type="submit" style="border: medium none; background-color: rgb(255, 87, 0); padding: 10px 20px; color: rgb(255, 255, 255); text-transform: uppercase; margin-top: 10px;">Submit Comment</button>
</form>`;

module.exports = newCommentForm;