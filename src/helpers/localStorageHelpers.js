export function setLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

export function setUserInLocalStorage(value) {
  let svalue = JSON.stringify(value);
  let data = localStorage.getItem("savedUsers");
  if (!data) {
    localStorage.setItem("savedUsers", JSON.stringify([value]));
    return [value];
  }
  data = JSON.parse(data);
  let exist = data.findIndex((x) => x.id === value.id) !== -1;
  if (!exist) {
    data.push(value);
  }
  localStorage.setItem("savedUsers", JSON.stringify(data));
  return data;
}
