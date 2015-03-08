function TwisterPost(data) {
    this._data = data;
}


TwisterPost.prototype.getId = function () {
    return this._data.userpost.k;
}
TwisterPost.prototype.getContent = function () {
    return this._data.userpost.msg;
}