window.addEventListener('load', function() {
  const isChrome = /Chrome/.test(navigator.userAgent);
  if (isChrome) {
    const element = document.getElementById("safari-extension");
    element.style.display = 'none';
  } else {
    var element = document.getElementById("chrome-extension");
    element.style.display = 'none';
  }
});