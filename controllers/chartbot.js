const axios = require("axios")
const { randomBytes } = require("crypto")
const libphonenumber = require("libphonenumber-js")
const { v4: uuid } = require("uuid")
const dotenv = require('dotenv')
const fs = require('fs').promises;
const path = require('path');
const mime = require("mime-types")
const User = require("../models/User")
dotenv.config();


const randomString = (length) => {
	if (length % 2 !== 0) {
		length++
	}

	return randomBytes(length / 2).toString("hex")
}


const preparePlainText = (recipient, text) => {
	const data = {
		"messaging_product": "whatsapp",
		"preview_url": false,
		"recipient_type": "individual",
		"to": recipient,
		"type": "text",
		"text": {
			"body": text
		}
	}

	return JSON.stringify(data)
}


const prepareList = (recipient, header, message, footer, options, buttontext) => {
	console.log(recipient, header, message, footer, options, buttontext)
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "list",
			// "header": {
			// 	"type": "image",
			// 	"image": {
			// 		"link": `${process.env.SERVER_URL}${header}`
			// 	}
			// },
			"body": {
				"text": message
			},
			"footer": footer ? {
				"text": footer
			} : undefined,
			"action": {
				"button": buttontext ? buttontext : "Show options",
				"sections": [
					{
						"title": "Main Menu Options",
						"rows": options.map(option => {
							return {
								"id": option.id,
								"title": option.title,
								"description": option.text,
							};
						})
					}
				]
			}
		}
	}

	return JSON.stringify(data)
}


const prepareButtons = (recipient, header, message, footer, buttons) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "button",
			"header": header ? {
				"type": "text",
				"text": header
			} : undefined,
			"body": {
				"text": message
			},
			"footer": footer ? {
				"text": footer
			} : undefined,
			"action": {
				"buttons": buttons.map(button => {
					return {
						"type": "reply",
						"reply": {
							"id": button.id,
							"title": button.text
						}
					}
				})
			}
		}
	}

	return JSON.stringify(data)
}

const prepareImage = (recipient, link, caption) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "image",
		"image": {
			"link": link,
			"caption": caption ? caption : undefined
		}
	}

	return JSON.stringify(data)
}

const prepareMedia = (recipient, link, filename, caption) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "document",
		"document": {
			"link": link,
			"filename": filename,
			"caption": caption ? caption : undefined
		}
	}

	return JSON.stringify(data)
}

const prepareLocation = (recipient, longitude, latitude, name, address) => {
	const data = {
		"messaging_product": "whatsapp",
		"to": recipient,
		"type": "location",
		"location": {
			"longitude": longitude,
			"latitude": latitude,
			"name": name,
			"address": address
		}
	}

	return JSON.stringify(data)
}
const prepareWelcomeTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": "hello_world",
			"language": {
				"code": "en_US"
			},
			"components": []
		}
	}

	return JSON.stringify(data)
}
const prepareWelcomeTemplateImage = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": "welcome_image",
			"language": {
				"code": "en"
			},
			"components": [
				{
					"type": "header",
					"parameters": [
						{
							"type": "image",
							"image": {
								"link": "https://gkhbot.vibhohcm.com/assets/images/welcome.PNG"
							}
						}
					]
				},
			]
		}
	}

	return JSON.stringify(data)
}
const prepareTemplate = (recipient, template, image) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": template,
			"language": {
				"code": "en"
			},
			"components": [{
				"type": "button",
				"sub_type": "CATALOG",
				"index": 0,
				"parameters": [
					{
						"type": "action",
						"action": {
							"thumbnail_product_retailer_id": "lyqzvx2hzv"
						}
					}
				]
			}]
		}
	}

	return JSON.stringify(data)
}

const prepareProducts = (recipient, body, footer, categories) => {
	const sections = []

	const __data = {
		vegetables: {
			"title": "Vegetables",
			"product_items": [
				{ "product_retailer_id": "bwzogstyyg" },
				{ "product_retailer_id": "x7v9y6nrvk" }
			]
		},
		dairy: {
			"title": "Dairy Products",
			"product_items": [
				{ "product_retailer_id": "7ys1b5vwju" },
				{ "product_retailer_id": "lyqzvx2hzv" },
				{ "product_retailer_id": "8jtte93vti" }
			]
		}
	}

	categories.forEach(item => {
		sections.push(__data[item])
	})

	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "product_list",
			"header": {
				"type": "text",
				"text": "Catalogue"
			},
			"body": {
				"text": body
			},
			"footer": {
				"text": footer
			},
			"action": {
				"catalog_id": "1725466457977945",
				"sections": sections
			}
		}
	}

	return JSON.stringify(data)
}

const preparePayment_before = (recipient, items) => {
	let subtotal = 0

	items.forEach(item => {
		subtotal += item.amount.value * item.quantity
	})
	subtotal = subtotal / 100

	let message = "Here are the items ordered:\n";
	items.forEach((item, index) => {
		message += `${index + 1}. ${item.name} - ZAR ${item.amount.value / 100} - ${item.quantity} \n`;
	});
	const timestamp = Date.now() + (20 * 60 * 1000)

	const unix = Math.floor(timestamp / 1000)
	const buttons = [
		{ id: 4, text: "Submit" }
	]

	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "text",
		"text": {
			"body": message + "\n\n"
		}
	}

	return JSON.stringify(data)
}
const preparePayment = (recipient, items) => {
	let subtotal = 0

	items.forEach(item => {
		subtotal += item.amount.value * item.quantity
	})
	subtotal = subtotal / 100
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": 'make_payment',
			"language": {
				"code": "en"
			},
			"components": [

				{
					"type": "body",
					"parameters": [
						{
							"type": "text",
							"text": subtotal
						}
					]
				}]
		}
	}

	return JSON.stringify(data)


}

// status can be "processing | partially_shipped | shipped | completed | canceled"
const prepareOrderStatus = (recipient, reference, status) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "order_status",
			"body": {
				"text": "*We have received the payment* 🎊\n\nThe delivery agent will contact you shortly to collect your location information.\nFeel free to reach out if you have any other questions! 😊"
			},
			"action": {
				"name": "review_order",
				"parameters": {
					"reference_id": reference,
					"order": {
						"status": status,
						"description": "Thank you for purchase"
					}
				}
			}
		}
	}

	return JSON.stringify(data)
}

// Prepare data using above methods, the call this api to send message
const sendMessage = async (data) => {
	var config = {
		method: "post",
		url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
		headers: {
			'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
			'Content-Type': 'application/json'
		},
		data: data
	}

	return axios(config)
}

// Download the media sent using id
// Returns filename stored on the server
const downloadMedia = async (mediaid, mimetype) => {
	// get the public file link from whatsapp
	const response = await axios.get(`https://graph.facebook.com/${process.env.VERSION}/${mediaid}`, {
		headers: {
			'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
		}
	})

	const link = response.data.url

	// file binary
	const file = await axios.get(link, {
		headers: {
			'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
		},
		responseType: "arraybuffer"
	})

	const extention = mime.extension(mimetype)

	const hash = uuid()

	const filename = `${hash}.${extention}`

	// save file to server
	await fs.writeFile(
		path.join(__dirname, "..", "assets", filename), file.data
	)

	return filename
}

// Parse the plain text messages from user
const handleTextNoEmployee = async (message, phonenumber, username) => {
	return { type: "text", message: "You are not authorised person.. " }
}
const handleText = async (message, phonenumber, username) => {
	console.log(message.toLowerCase())
	const listdata = [
		// { _id: '101', title: 'GOld Rate', text: 'GOld Rate' },
		{ _id: '102', title: 'Visit Our Showroom', text: 'VISIT OUR SHOWROOM FOR BEST PRICE' },
		{ _id: '103', title: 'Our Schemes', text: 'Our Schemes' },
		{ _id: '104', title: 'New Arrivals', text: 'New Arrivals' },
		{ _id: '105', title: 'Chat with Our Agent', text: 'Chat with Our Agent' },
		{ _id: '106', title: 'About Us/Contact Us', text: 'About Us/Contact Us' },
	]
	// if (message.toLowerCase() === 'hi' || message.toLowerCase() === 'hello') {

	return {
		type: "list",
		message: {
			header: `public/store_image.jpg`,
			text: `Hi ${username},\n\nwelcome to Siri Samruddhi Gold Palace.`,
			footer: "please choose below options..",
			buttontext: 'Show options',
			options: listdata.map((dep, index) => {
				return {
					id: `${dep._id}`,
					title: dep.title,
					text: dep.text
				}
			})
		}
	}
	// }

}

const prepareimageLocation = (recipient, header, text, lat, lang) => {
	console.log(recipient, header, text, lat, lang);

	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "cta_url",
			"header": {
				"type": "image",
				"image": {
					"link": `${process.env.SERVER_URL}${header}`,
				}
			},
			"body": {
				"text": text
			},
			"footer": {
				"text": "Tap below for more details"
			},
			"action": {
				"name": "cta_url",
				"parameters": {
					"display_text": "View Location on Map",
					"url": `https://www.google.com/maps?q=${lat},${lang}`
				}
			}
		}

	}
	return JSON.stringify(data);
}



// Parse the button or list clicks from user
const handleInteractive = async (option, phonenumber, username) => {
	console.log("option data")
	console.log(option)

	console.log("message")
	console.log(phonenumber)
	console.log(username)
	const today = new Date()
	const currentDate = new Date();
	const dateOnly = currentDate.toISOString().split('T')[0];


	if (option.id === "102") {
		return {
			type: "button",
			message: {
				header: undefined,
				text: `Our showroom awaits you with the best prices on gold!\n\nVisit us to explore our latest collections and find the perfect piece.`,
				footer: "Please select an  option",
				buttons: [
					{ id: 107, text: "Yelahanka Location" },
					{ id: 108, text: "Kolar Location " },
					{ id: 109, text: "Main Menu" }
				]
			}
		}
	}
	if (option.id === "103") {
		return {
			type: "button",
			message: {
				header: undefined,
				text: `Our showroom awaits you with the best prices on gold!\n\nVisit us to explore our latest collections and find the perfect piece.`,
				footer: "Please select an  option",
				buttons: [
					{ id: 107, text: "Yelahanka Location" },
					{ id: 108, text: "Kolar Location " },
					{ id: 109, text: "Main Menu" }
				]
			}
		}
	}
	if (option.id === "107") {
		return {
			type: "imageLocation",
			message: {
				header: `public/store_image.jpg`,
				text: 'Welcome to Yelahanka Branch \n\nCheck out this location!',
				latitude: '13.093621273486704',
				longitude: '77.58230287116436'
			}
		}
	}
	if (option.id === "108") {
		return {
			type: "imageLocation",
			message: {
				header: `public/store_image2.jpg`,
				text: 'Welcome to kolar Branch \n\nCheck out this location!',
				latitude: '13.136892893055961',
				longitude: '78.13037966473152'
			}
		}
	}
	if (option.id === "109") {
		const listdata = [
			// { _id: '101', title: 'GOld Rate', text: 'GOld Rate' },
			{ _id: '102', title: 'Visit Our Showroom', text: 'VISIT OUR SHOWROOM FOR BEST PRICE' },
			{ _id: '103', title: 'Our Schemes', text: 'Our Schemes' },
			{ _id: '104', title: 'New Arrivals', text: 'New Arrivals' },
			{ _id: '105', title: 'Chat with Our Agent', text: 'Chat with Our Agent' },
			{ _id: '106', title: 'About Us/Contact Us', text: 'About Us/Contact Us' },
		]
		// if (message.toLowerCase() === 'hi' || message.toLowerCase() === 'hello') {
		// const user = await User.findOne({ MobileNumber: phonenumber });
		// if (!user) {
		// 	await User.create({
		// 		UserName: username,
		// 		MobileNumber: phonenumber
		// 	});
		// }
		return {
			type: "list",
			message: {
				header: `public/store_image.jpg`,
				text: `Hi ${username},\n\nwelcome to Siri Samruddhi Gold Palace.`,
				footer: "please choose below options..",
				buttontext: 'Show options',
				options: listdata.map((dep, index) => {
					return {
						id: `${dep._id}`,
						title: dep.title,
						text: dep.text
					}
				})
			}
		}
	}



	if (option?.name == "flow") {  //ticketchecking
		console.log(JSON.parse(option.response_json))
		const resmess = JSON.parse(option.response_json)
		if (resmess.screen_0_TextArea_0 != "undefined" && resmess.screen_0_TextArea_0 != null) {

			const currentDate = new Date();
			const dateOnly = currentDate.toISOString().split('T')[0];
			let is_employee_login = await EmployeeTimings.findOne({ mobileNo: phonenumber, checkInDate: dateOnly });
			if (is_employee_login) {
				let is_employee_ticket = await SessionTickets.findOne({ mobileNo: phonenumber });
				if (is_employee_ticket) {
					await SessionTickets.findOneAndUpdate(
						{ mobileNo: phonenumber },
						{
							description: resmess.screen_0_TextArea_0,
							issuePriority: resmess.screen_0_Dropdown_1.substring(2)
						}
					)
					return { type: "text", message: "Please send issue 📍 location " }
					// return {
					// 	type: "button",
					// 	message: {
					// 		header: undefined,
					// 		text: "You have raised a complaint @ "+is_employee_ticket.issueDepartmentId.name+ " Department \n\n Your message is " +resmess.screen_0_TextArea_0+". \n\nPlease give confirmation below..  " ,
					// 		buttons: [
					// 			{ id: 104, text: "Yes" },
					// 			{ id: 105, text: "No" }
					// 		]
					// 	}
					// }

				} else {
					let department_data = await Department.find({ status: true });
					return {
						type: "list",
						message: {
							// header: "Select Department",
							text: "Choose the concerned Department to raise an Issue",
							// footer: "Select an option",
							options: department_data.map((dep, index) => {
								let depname = dep.name.length > 20 ? dep.name.substring(0, 20) + '...' : dep.name;
								let depDesc = dep.Description.length > 20 ? dep.Description.substring(0, 20) + '...' : dep.Description;
								return {
									id: `${dep._id.toString()}`,
									title: depname,
									text: depDesc
								}
							})
						}
					}
				}

			} else {
				return { type: "text", message: "You are not Check-in in yet. Please send the current 📍 location for Check-in" }
			}


		} else if (resmess.screen_0_TextInput_0 != "undefined" && resmess.screen_0_TextInput_0 != null) {
			const currentDate = new Date();
			const dateOnly = currentDate.toISOString().split('T')[0];
			let is_employee_login = await EmployeeTimings.findOne({ mobileNo: phonenumber, checkInDate: dateOnly });
			if (is_employee_login) {
				let is_employee_ticket = await EmployeeTickets.findOne({ ticket_no: resmess.screen_0_TextInput_0 });
				if (is_employee_ticket) {
					let responseMessage;
					responseMessage = "Ticket status is " + is_employee_ticket.status;
					if (is_employee_ticket.managerDescription) {
						responseMessage = responseMessage + ". Department Manager added a message => " + is_employee_ticket.managerDescription;
					}
					if (is_employee_ticket.commissionerDescription) {
						responseMessage = responseMessage + ". Commissioner  added a message => " + is_employee_ticket.commissionerDescription;
					}
					return { type: "text", message: responseMessage }

				} else {
					return {
						type: "button",
						message: {
							header: undefined,
							text: `We did't found any TICKET in this ID, please try again`,
							footer: "Please select an  option",
							buttons: [
								{ id: 101, text: "Raise an Issue " },
								{ id: 102, text: "Issue Status " },
								{ id: 103, text: "Check Out " }
							]
						}
					}
				}

			} else {
				return { type: "text", message: "You are not Check-in in yet. Please send the current 📍 location for Check-in" }
			}
		}
		else {
			let department_data = await Department.find({ status: true });
			return {
				type: "list",
				message: {
					// header: "Select Department",
					text: "Not valid Input, Choose the concerned Department to raise an Issue",
					// footer: "Select an option",
					options: department_data.map((dep, index) => {
						let depname = dep.name.length > 20 ? dep.name.substring(0, 20) + '...' : dep.name;
						let depDesc = dep.Description.length > 20 ? dep.Description.substring(0, 20) + '...' : dep.Description;
						return {
							id: `${dep._id.toString()}`,
							title: depname,
							text: depDesc
						}
					})
				}
			}
		}
		//screen_0_TextInput_0

	}
	const optionid = option?.id;

	if (optionid.length == "24") {
		let is_employee_login = await EmployeeTimings.findOne({ mobileNo: phonenumber, checkInDate: dateOnly });
		if (is_employee_login) {

			await SessionTickets.create({
				employeeId: is_employee_login.employeeId._id.toString(),
				mobileNo: phonenumber,
				issueDepartmentId: optionid
			});
			return { type: "text", message: "Please send the image/pic to enable the resolution quick" }
		} else {
			return { type: "text", message: "You are not Check-in in yet. Please send the current 📍 location for Check-in" }
		}
	}
	if (option.id == "Yes") {
		return { type: "text", message: "Thank you for bringing the issue to our attention. " }
	}

	return { type: "text", message: "Invalid identifier received" }
}


const handleImage = async (imageData, phonenumber, username) => {
	// const imageData={
	// 	mime_type: 'image/jpeg',
	// 	sha256: '2yb545Oh9n0sECA/8B8bAgW3txBs1oMC/bdGA325I3Y=',
	// 	id: '472567508851730'
	//   }
	const response = await axios.get(`https://graph.facebook.com/${process.env.VERSION}/${imageData.id}`, {
		headers: {
			'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
		}
	})

	const link = response.data.url

	// file binary
	const file = await axios.get(link, {
		headers: {
			'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
		},
		responseType: "arraybuffer"
	})

	const extention = mime.extension(imageData.mime_type)

	const hash = uuid()

	const filename = `${hash}.${extention}`

	// save file to server
	await fs.writeFile(
		path.join(__dirname, "..", "public", filename), file.data
	)

	console.log(filename)
	const currentDate = new Date();
	const dateOnly = currentDate.toISOString().split('T')[0];
	let is_employee_login = await EmployeeTimings.findOne({ mobileNo: phonenumber, checkInDate: dateOnly });
	if (is_employee_login) {
		let is_employee_ticket = await SessionTickets.findOne({ mobileNo: phonenumber });
		if (is_employee_ticket) {
			await SessionTickets.findOneAndUpdate(
				{ mobileNo: phonenumber },
				{
					imageUrl: filename
				}
			)
			return {
				type: "issue_description",
				message: "Please enter your description as message..."
			}
		} else {
			let department_data = await Department.find({ status: true });
			return {
				type: "list",
				message: {
					// header: "Select Department",
					text: "Choose the concerned Department to raise an Issue",
					// footer: "Select an option",
					options: department_data.map((dep, index) => {
						let depname = dep.name.length > 20 ? dep.name.substring(0, 20) + '...' : dep.name;
						let depDesc = dep.Description.length > 20 ? dep.Description.substring(0, 20) + '...' : dep.Description;
						return {
							id: `${dep._id.toString()}`,
							title: depname,
							text: depDesc
						}
					})
				}
			}
		}

	} else {
		return { type: "text", message: "You are not Check-in in yet. Please send the current 📍 location for Check-in" }
	}
}


const handleLocation = async (location, phonenumber, username) => {
	console.log(location)
	const currentDate = new Date();
	const dateOnly = currentDate.toISOString().split('T')[0];
	const [datePart, timePart] = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',');
	const Time = timePart.trim();
	if (location.name || location.url || location.address) {
		return { type: "text", message: "You manually selected a location\n\nPlease send live location" }
	} else {

		let is_employee_ticket = await SessionTickets.findOne({ mobileNo: phonenumber });
		if (is_employee_ticket) {
			await SessionTickets.findOneAndUpdate(
				{ mobileNo: phonenumber },
				{
					issue_latitude: location.latitude,
					issue_longitude: location.longitude,
				}
			)

			return {
				type: "button",
				message: {
					header: undefined,
					text: "You have raised a complaint @ " + is_employee_ticket.issueDepartmentId.name + " Department \n\n Your message is " + is_employee_ticket.description + ". \n\nPlease give confirmation below..  ",
					buttons: [
						{ id: 104, text: "Yes" },
						{ id: 105, text: "No" }
					]
				}
			}

		} else {
			let employee_data = await Employees.findOne({ mobileNo: phonenumber });
			console.log(employee_data)
			if (employee_data) {
				let is_employee_login = await EmployeeTimings.findOne({ mobileNo: phonenumber, checkInDate: dateOnly });
				if (is_employee_login) {
					if (is_employee_login.checkOutTime) {
						return { type: "text", message: "You are already Checkout for this day. " }
					} else {
						await EmployeeTimings.findOneAndUpdate(
							{ mobileNo: phonenumber, checkInDate: dateOnly },
							{
								checkout_latitude: location.latitude,
								checkout_longitude: location.longitude,
								checkOutTime: Time
							}
						)
						return { type: "text", message: "You are Checkout successfully. " }
					}


				} else {
					const currentDate = new Date();
					const [datePart, timePart] = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',');
					const Time = timePart.trim();

					const dateOnly = currentDate.toISOString().split('T')[0];

					await EmployeeTimings.create({
						employeeId: employee_data._id.toString(),
						mobileNo: phonenumber,
						latitude: location.latitude,
						longitude: location.longitude,
						checkInTime: Time,
						checkInDate: dateOnly
					});
					let department_data = await Department.find({ status: true });
					return {
						type: "list",
						message: {
							// header: "Select Department",
							text: "Choose the concerned Department",
							footer: "",
							options: department_data.map((dep, index) => {
								let depname = dep.name.length > 20 ? dep.name.substring(0, 20) + '...' : dep.name;
								let depDesc = dep.Description.length > 20 ? dep.Description.substring(0, 20) + '...' : dep.Description;
								return {
									id: `${dep._id.toString()}`,
									title: depname,
									text: depDesc
								}
							})
						}
					}
				}

			} else {
				return { type: "text", message: "You are not authorised person" }
			}
		}

	}
}

const handleLocationUser = async (location, phonenumber, username) => {

	const currentDate = new Date();
	const dateOnly = currentDate.toISOString().split('T')[0];
	const [datePart, timePart] = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',');
	const Time = timePart.trim();
	if (location.name || location.url || location.address) {
		return { type: "text", message: "You manually selected a location\n\nPlease send live location" }
	} else {

		let is_employee_ticket = await SessionTickets.findOne({ mobileNo: phonenumber });
		if (is_employee_ticket) {
			await SessionTickets.findOneAndUpdate(
				{ mobileNo: phonenumber },
				{
					issue_latitude: location.latitude,
					issue_longitude: location.longitude,
				}
			)

			return {
				type: "button",
				message: {
					header: undefined,
					text: "You have raised a complaint @ " + is_employee_ticket.issueDepartmentId.name + " Department \n\n Your message is " + is_employee_ticket.description + ". \n\nPlease give confirmation below..  ",
					buttons: [
						{ id: 104, text: "Yes" },
						{ id: 105, text: "No" }
					]
				}
			}

		} else {
			let department_data = await Department.find({ status: true });
			return {
				type: "list",
				message: {
					// header: "Select Department",
					text: "Choose the concerned Department",
					footer: "",
					options: department_data.map((dep, index) => {
						let depname = dep.name.length > 20 ? dep.name.substring(0, 20) + '...' : dep.name;
						let depDesc = dep.Description.length > 20 ? dep.Description.substring(0, 20) + '...' : dep.Description;
						return {
							id: `${dep._id.toString()}`,
							title: depname,
							text: depDesc
						}
					})
				}
			}
		}

	}
}
const handleButton = async (button) => {
	const { payload, text } = button


	if (payload === "Book Now") {
		return {
			type: "booknow",
			message: "booknow"
		}
	}

	return { type: "text", message: "I don't know what to do with the button click" }
}

const handleOrders = async (order) => {
	const keys = {
		"bwzogstyyg": {
			name: "Broccoli",
			image: "https://i.ibb.co/k5tv2FY/broccoli.jpg"
		},
		"x7v9y6nrvk": {
			name: "Tomato",
			image: "https://i.ibb.co/7ydRwwm/garden-tomatoes.jpg"
		},
		"7ys1b5vwju": {
			name: "Butter",
			image: "https://i.ibb.co/SQhb8Vm/dairy-products-and-diabetes.jpg"
		},
		"lyqzvx2hzv": {
			name: "Cheese",
			image: "https://i.ibb.co/vv9hMbK/variety-dairy-products.jpg"
		},
		"8jtte93vti": {
			name: "Condensed Milk",
			image: "https://i.ibb.co/1nCpSVj/milk-dairy-products.jpg"
		}
	}

	const items = order.product_items.map(item => {
		return {
			"name": keys[item.product_retailer_id].name,
			"image": {
				"link": keys[item.product_retailer_id].image
			},
			"amount": {
				"value": item.item_price * 100,
				"offset": 100
			},
			"quantity": item.quantity
		}
	})

	return {
		type: "payment",
		payment: {
			items
		}
	}
}

// Verfiy the web hooks
const verifyWebhooks = async (req, res) => {
	console.log({ query: req.query, token: process.env.VERIFY_TOKEN })
	if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	else {
		res.sendStatus(400)
	}
	/*
	#swagger.tags = ['ChartBot']
	*/
}

// Receive message events
const receiveEvents = async (req, res) => {
	const { object, entry } = req.body

	console.log({ entry: JSON.stringify(entry, null, 2) })

	if (object) {
		if (
			entry &&
			entry[0].changes &&
			entry[0].changes[0] &&
			entry[0].changes[0].value.statuses &&
			entry[0].changes[0].value.statuses[0]
		) {
			const receivedon = entry[0].changes[0].value.metadata.phone_number_id

			// Message sent to other phone numbers on same webhook
			if (receivedon !== process.env.PHONE_NUMBER_ID) {
				return
			}

			const status = entry[0].changes[0].value.statuses[0]

			const phonenumber = status.recipient_id

			if (status.type === "payment" && status.payment.transaction.status === "success") {
				const reference = status.payment.reference_id

				const prepareschema = prepareOrderStatus(phonenumber, reference, "completed")

				try {
					const data = await sendMessage(prepareschema)
				} catch (error) {
					console.log("[-] Failed to send message")
					console.log({ error, info: error.response.data, errordata: error.response.data.error.error_data })
				}
			}
		}

		else if (
			entry &&
			entry[0].changes &&
			entry[0].changes[0] &&
			entry[0].changes[0].value.messages &&
			entry[0].changes[0].value.messages[0]
		) {
			const messagebody = entry[0].changes[0].value.messages[0]
			const username = entry[0].changes[0].value.contacts[0].profile.name

			const receivedon = entry[0].changes[0].value.metadata.phone_number_id

			// Message sent to other phone numbers on same webhook
			if (receivedon !== process.env.PHONE_NUMBER_ID) {
				return
			}
			const today = new Date()

			today.setHours(0, 0, 0, 0)
			const phonenumber = messagebody.from

			// Fetch user session
			const parser = libphonenumber.parsePhoneNumberFromString(`+${phonenumber}`)
			const countrycode = parser.number.replace(parser.nationalNumber, '')

			console.log({ username, countrycode, phonenumber, messagebody })
			let reply
			let prepareschema
			let prepareschema_dep

			let user = await User.findOne({ MobileNumber: parser.nationalNumber });

			if (!user) {
				await User.create({
					UserName: username,
					MobileNumber: parser.nationalNumber
				});
			}
			let UserData = await User.findOne({ MobileNumber: parser.nationalNumber });
			// let existingAuthor = await Author.findOne({ phone: parser.nationalNumber });
			if (UserData) {

				if (messagebody.type === "text") {
					reply = await handleText(messagebody.text.body, parser.nationalNumber, username)
				} else if (messagebody.type === "interactive") {
					reply = await handleInteractive(messagebody.interactive[messagebody.interactive.type], parser.nationalNumber, username)
				}
				if (reply.type === "list") {
					prepareschema = prepareList(phonenumber, reply.message.header, reply.message.text, reply.message.footer, reply.message.options, reply.message.buttontext)
				} else if (reply.type === 'imageLocation') {
					prepareschema = prepareimageLocation(phonenumber, reply.message.header, reply.message.text, reply.message.latitude, reply.message.longitude);
				} else if (reply.type === 'button') {
					prepareschema = prepareButtons(phonenumber, reply.message.header, reply.message.text, reply.message.footer, reply.message.buttons)
				}

				else {
					prepareschema = preparePlainText(phonenumber, "Something went wrong")
				}

				try {
					const data = await sendMessage(prepareschema)
				} catch (error) {
					console.log("[-] Failed to send message")
					console.log({ error, info: error.response.data, errordata: error.response.data.error.error_data })
				}





			}


		}

		res.sendStatus(200)
	} else {
		res.sendStatus(404)
	}
	/*
	#swagger.tags = ['ChartBot']
	*/
}
const prepareFeedbackTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": recipient,
		"type": "template",
		"template": {
			"name": "raiseticket",
			"language": {
				"code": "en_US"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [
						{ "type": "text", "text": "Feedback" }
					]
				}

			]
		}
	}
	return JSON.stringify(data)
}

const prepareIssueStatusTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": recipient,
		"type": "template",
		"template": {
			"name": "ticketchecking",
			"language": {
				"code": "en_US"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [
						{ "type": "text", "text": "Description" }
					]
				}

			]
		}
	}
	return JSON.stringify(data)
}
const prepareIssueDescriptionTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": recipient,
		"type": "template",
		"template": {
			"name": "issuemessage",
			"language": {
				"code": "en_US"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [
						{ "type": "text", "text": "Description" }
					]
				}

			]
		}
	}
	return JSON.stringify(data)
}
const prepareStaffIssueDescriptionTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": recipient,
		"type": "template",
		"template": {
			"name": "staffmessageissue",
			"language": {
				"code": "en_US"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [
						{ "type": "text", "text": "Description" }
					]
				}

			]
		}
	}
	return JSON.stringify(data)
}

const prepareBooknowTemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": recipient,
		"type": "template",
		"template": {
			"name": "booking",
			"language": {
				"code": "en"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [{ "type": "text", "text": "Book Now" }]
				}]
		}
	}
	return JSON.stringify(data)
}

const prepareConfirmation = (recipient, imagename, department_name, discription, employee_name, lat, lang, issue_id, issue_date, issue_raised_by) => {
	const date = new Date(issue_date);
	date.setHours(date.getHours() + 5);
	date.setMinutes(date.getMinutes() + 30);
	const formattedDate = date.toLocaleDateString();
	const formattedTime = date.toLocaleTimeString();

	console.log(`${formattedDate} ${formattedTime}`);
	let issueDate = `${formattedDate} ${formattedTime}`;
	const googleMapsLink = `https://www.google.com/maps?q=${lat},${lang}`;
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": 'confirmissue',
			"language": {
				"code": "en_US"
			},
			"components": [

				{
					"type": "header",
					"parameters": [
						{
							"type": "image",
							"image": {
								"link": "https://nudabackend.vibhohcm.com/public/" + imagename
							}
						}
					]
				},
				{
					"type": "body",
					"parameters": [
						{
							"type": "text",
							"text": issue_raised_by
						},
						{
							"type": "text",
							"text": employee_name
						},
						{
							"type": "text",
							"text": department_name
						},
						{
							"type": "text",
							"text": discription
						},
						{
							"type": "text",
							"text": issue_id
						},
						{
							"type": "text",
							"text": issueDate
						},
						{
							"type": "text",
							"text": googleMapsLink
						}
					]
				}
			]
		}
	}

	return JSON.stringify(data)
}
const prepareBookNow = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "cta_url",

			/* Header optional */
			"header": {
				"type": "text",
				"text": "Payment"
			},

			/* Body optional */
			"body": {
				"text": "Please go through our website"
			},

			/* Footer optional */
			"footer": {
				"text": "Tahank you"
			},
			"action": {
				"name": "cta_url",
				"parameters": {
					"display_text": "Book Now",
					"url": "https://www.gkhvresort.com/"
				}
			}
		}
	}

	return JSON.stringify(data)
}
const prepareFeedback = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "interactive",
		"interactive": {
			"type": "button",
			"header": {
				"type": "text",
				"text": "Rate Our Service"
			},
			"body": {
				"text": "We hope you enjoyed our service! Please rate your experience:"
			},
			"footer": {
				"text": "Your feedback helps us improve."
			},
			"action": {
				"buttons": [
					//   {
					// 	"type": "reply",
					// 	"reply": {
					// 	  "id": "rating_excellent",
					// 	  "title": "🌟 Excellent"
					// 	}
					//   },
					{
						"type": "reply",
						"reply": {
							"id": "rating_good",
							"title": "👍 Good"
						}
					},
					{
						"type": "reply",
						"reply": {
							"id": "rating_average",
							"title": "👌 Average"
						}
					},
					{
						"type": "reply",
						"reply": {
							"id": "rating_poor",
							"title": "👎 Poor"
						}
					}
				]
			}
		}
	}
	return JSON.stringify(data)
}

const prepareImageTest = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "image",
		"image": {
			"link": "https://gkhbot.vibhohcm.com/assets/images/verti.jpeg",
			"caption": "Welcome"
		}
	}

	return JSON.stringify(data)
}
const preparetesttemplate = (recipient) => {
	const data = {
		"messaging_product": "whatsapp",

		"to": "7093053987",
		"type": "template",
		"template": {
			"name": "feedback",
			"language": {
				"code": "en_US"
			},
			"components": [
				{
					"type": "button",
					"sub_type": "flow",
					"index": 0,
					"parameters": [{ "type": "text", "text": "Feedback" }]
				}]
		}
	}
	return JSON.stringify(data)
}

const preparePlainTextDepartment = (recipient, title, discription) => {

	const data = {
		"messaging_product": "whatsapp",
		"recipient_type": "individual",
		"to": recipient,
		"type": "template",
		"template": {
			"name": 'department_message',
			"language": {
				"code": "en_US"
			},
			"components": [

				{
					"type": "header",
					"parameters": [
						{
							"type": "text",
							"text": title
						}
					]
				},
				{
					"type": "body",
					"parameters": [
						{
							"type": "text",
							"text": discription
						}
					]
				}
			]
		}
	}

	return JSON.stringify(data)
}
const sendNotification = async (req, res) => {
	const { title, discription, depid } = req.body;
	const commid = req.userid._id;
	const department = await Department.findOne({ _id: depid });
	if (!department) {
		res.status(404).json({ success: false, message: "Department Not Found" });
	}
	if (!department.DepartmentHead) {
		res.status(404).json({ success: false, message: "Department Head Not Found" });
	}
	const recipient = department?.DepartmentHead?.mobileNo;
	prepareschema = preparePlainTextDepartment(recipient, title, discription)
	try {
		const postData = await Notification.create({
			title: title,
			description: discription,
			departmentId: depid,
			senderCommissionerId: commid,
			managerName: department?.DepartmentHead?.firstName + " " + department?.DepartmentHead?.lastName,
			managerNumber: department?.DepartmentHead?.mobileNo
		})
		const response = await sendMessage(prepareschema)

		console.log(response.data)
		res.status(200).json({ success: true, message: "Message Sent Successfully", data: response.data })
	} catch (error) {
		console.log("[-] Failed to send message")
		console.log({ error, info: error.response.data, errordata: error.response.data.error.error_data })
	}
	/*
	#swagger.tags = ['ChartBot']
	*/
}

const receiveEventsTest = async (req, res) => {



	latitude = 17.4481933
	longitude = 78.3793731

	const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
	// reply = await handleTextImage(googleMapsLink,"7093035343","sdadad")

	prepareschema = preparePlainText('7093053987', googleMapsLink)

	try {
		const res = await sendMessage(prepareschema)

		console.log(res.data)
	} catch (error) {
		console.log("[-] Failed to send message")
		console.log({ error, info: error.response.data, errordata: error.response.data.error.error_data })
	}
	/*
	#swagger.tags = ['ChartBot']
	*/
}
module.exports = {
	verifyWebhooks,
	receiveEvents,
	receiveEventsTest,
	sendNotification,
	preparePlainTextDepartment,
	sendMessage
}
