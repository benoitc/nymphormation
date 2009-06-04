// simple helper to reder template from ejs
//

function template(str, data) {
    html = new EJS({text: str}).render(data);
    return html;
}


