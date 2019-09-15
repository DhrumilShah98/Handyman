document.addEventListener('DOMContentLoaded', function () {

	var beauty = "<option value='salon_at_home'>Salon At Home</option>" +
		"<option value='hair_artist'>Hair Artist</option>" +
		"<option value='hair_hand_mehndi'>Hair And Hand Mehndi</option>" +
		"<option value='bridal_makeup_dressup_artist'>Bridal Makeup And DressUp Artist</option>" +
		"<option value='groom_makeup_dressup_artist'>Groom Makeup And DressUp Artist</option>";

	var appliance_repair = "<option value='ro_water_purifier_repair'>RO Or Water Purifier Repair</option>" +
		"<option value='ac_service_repair'>AC Service And Repair</option>" +
		"<option value='washing_machine_repair'>Washing Machine And Repair</option>" +
		"<option value='refrigerator_repair'>Refrigerator Repair</option>" +
		"<option value='microwave_repair'>Microwave Repair</option>" +
		"<option value='air_cooler_repair'>Air Cooler Repair</option>" +
		"<option value='geyser_water_heater_repair'>Geyser/Water Heater Repair</option>";

	var home_cleaning_repair = "<option value='carpentry'>Carpentry</option>" +
		"<option value='electrical'>Electrical</option>" +
		"<option value='plumbing'>Plumbing</option>" +
		"<option value='home_deep_cleaning'>Home Deep Cleaning</option>" +
		"<option value='kitchen_deep_cleaning'>Kitchen Deep Cleaning</option>" +
		"<option value='car_cleaning'>Car Cleaning</option>" +
		"<option value='pest_control'>Pest Control</option>" +
		"<option value='painting'>Painting</option>" +
		"<option value='furniture_shampooing_cleaning'>Furniture Shampooing And Cleaning</option>";

	var home_made_food = "<option value='cakes_and_chocolates'>Cakes And Chocolates</option>" +
		"<option value='different_pickles'>Different Pickles</option>" +
		"<option value='home_made_snacks'>Home Made Snacks</option>" +
		"<option value='tiffin_services'>Tiffin Services</option>";

	var none = "<option value=''>Sub Service</option>";

	document.querySelector("#service").addEventListener("change", function () {
		var service_val = document.querySelector('#service').value;
		if (service_val == "beauty") {
			document.querySelector("#subService").innerHTML = beauty;
		}
		else if (service_val == "appliance_repair") {
			document.querySelector("#subService").innerHTML = appliance_repair;
		}
		else if (service_val == "home_cleaning_repair") {
			document.querySelector("#subService").innerHTML = home_cleaning_repair;
		}
		else if (service_val == "home_made_food") {
			document.querySelector("#subService").innerHTML = home_made_food;
		}
		else {
			document.querySelector("#subService").innerHTML = none;
		}
	});
});