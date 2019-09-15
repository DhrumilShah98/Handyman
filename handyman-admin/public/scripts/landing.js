var images = [
	"/assets/images/landing/landing_image_2.jpg",
	"/assets/images/landing/landing_image_3.jpg",
	"/assets/images/landing/landing_image_4.jpg",
	"/assets/images/landing/landing_image_5.jpg",
	"/assets/images/landing/landing_image_1.jpg"
]

var bodyInstance = document.getElementsByTagName("body")[0];
var i = 0;
setInterval(function () {
	bodyInstance.style.backgroundImage = "url(" + images[i] + ")";
	i = i + 1;
	if (i == images.length) {
		i = 0;
	}
}, 3000);
