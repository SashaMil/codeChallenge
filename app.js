let companyData = require('./Companies.json');
let guestData = require('./Guests.json');
let messageTemplates = require('./MessageTemplates.json');

// This class is used for finding guests and companies by their IDs
// Additional searches can be added with a new method.
// Also contains a method that gets all the companyData and guestData's properties
class DataDomainManager {

    constructor(guest, company) {
        this.guestList = guestData;
        this.companyList = companyData;
    }

    findGuestById (id) {
      let result = this.guestList.filter(guest => {
        return id === guest.id;
      })[0];

      if (result === undefined) {
        throw 'Invalid Guest ID';
      }
      else {
        return result;
      }
    }

    findCompanyById (id) {
      let result = this.companyList.filter(company => {
        return id === company.id;
      })[0];

      if (result === undefined) {
        throw 'Invalid Company ID';
      }
      else {
        return result;
      }
    }

    getAllProperties() {
      return Object.getOwnPropertyNames(this.guestList[0]).concat(Object.getOwnPropertyNames(this.guestList[0].reservation)).concat(Object.getOwnPropertyNames(this.companyList[0]));
    }

}

// This class utiilizes companyData and guestData from dataDomainManager and renders messages.
// Contains a method to look up a template by id as well as render message by user inputted text or to render by Template // ID
class MessageCenter {
    constructor(dataDomainManager, timeUtility) {
        this.messageTemplateList = messageTemplates;
        this.dataDomainManager = dataDomainManager;
        this.timeUtility = timeUtility;
    }

    renderMessageByTemplateId(templateId, guestId, companyId) {
        let template = this.messageTemplateList.filter(message => {
          return templateId === message.id;
        })[0];

        if (template === undefined) {
          throw 'Invalid Template ID';
        }
        else {
          return this.renderMessageByText(template.message, guestId, companyId);
        }
    }

    renderMessageByText (template, guestId, companyId) {
        if (typeof template !== 'string') {
          throw 'Invalid Template';
        }
        else {
          let guestAndCompanyList = Object.assign(this.dataDomainManager.findGuestById(guestId), (this.dataDomainManager.findCompanyById(companyId)), (this.dataDomainManager.findGuestById(guestId).reservation));
          let propertyList = this.dataDomainManager.getAllProperties();
          for (let x = 0; x < propertyList.length; x++) {
            if (propertyList[x] === 'timezone') {
              template = template.replace(propertyList[x], this.timeUtility.timeZoneConversion(guestAndCompanyList[propertyList[x]]));
            }
            else {
              template = template.replace(propertyList[x], guestAndCompanyList[propertyList[x]]);
            }
          }
          console.log(template);
          return template;
        }
    }
}

// This class contains methods to help MessageCenter convert timezones.
class TimeUtility {

    // Timezones in the Companies.json file are not compatible with .toLocaleString() method.
    // Here, I am using the method timeZoneConversion to convert the timezone strings to the strings of timezones that work for .toLocaleString();
    // I also could have imported something like moment, but I thought it best to utilize the data given to me.
    // I am not mutating the json files.
    timeZoneConversion(timezone) {
        let timeOfDay = '';
        switch(timezone) {
          case 'US/Pacific':
            timeOfDay = this.timeOfDay(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric' }));
            break;
          case 'US/Central':
            timeOfDay = this.timeOfDay(new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric'}));
            break;
          case 'US/Eastern':
            timeOfDay = this.timeOfDay(Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric'}));
            break;
          default:
            return;
        }
        return timeOfDay;
    }

      // timeOfDay is a method to change the example string: '10 AM' to Morning.
      // Morning: 3 AM to 11 AM, Day: Noon to 4PM, Night: Every other hour
      timeOfDay(time) {
        if (time.slice(time.length - 2) === 'AM' && (parseInt(time.slice(0,2)) > 2)) {
          console.log('good');
          return 'morning';
        }
        else if (time.slice(time.length - 2) === 'PM' && (parseInt(time.slice(0,2)) < 5) || (parseInt(time.slice(0,2)) === 12)) {
          return 'afternoon';
        }
        else {
          return 'evening';
        }
      }
}


// *****************************************************
// ASSERTION TESTS
// *****************************************************


function templateAssertion() {
  let dataDomain = new DataDomainManager();
  let timeUtility = new TimeUtility();
  let message = new MessageCenter(dataDomain, timeUtility);
  let testResult = message.renderMessageByTemplateId(1,1,1);
  let expectedResult = 'Hotel California, Santa Barbara, evening, Candy, Pace, 529, 1486654792, 1486852373';
  if (testResult === expectedResult) {
    return 'Success for Template Assertion Test';
  }
  else {
    console.log(testResult);
    return 'Failed Template Assertion Test'
  }
}

function userTextAssertion() {
    let dataDomain = new DataDomainManager();
    let timeUtility = new TimeUtility();
    let message = new MessageCenter(dataDomain, timeUtility);
    let testResult = message.renderMessageByText('company, city, timezone, firstName, lastName, roomNumber, startTimestamp, endTimestamp',1,1);
    let expectedResult = 'Hotel California, Santa Barbara, evening, Candy, Pace, 529, 1486654792, 1486852373';
      if (testResult === expectedResult) {
        return 'Success for User Text Assertion Test';
      }
      else {
        console.log(testResult);
        return 'Failure for User Text Assertion Test';
      }
}

function templateAssertion2() {
    let dataDomain = new DataDomainManager();
    let timeUtility = new TimeUtility();
    let message = new MessageCenter(dataDomain, timeUtility);
    let testResult = message.renderMessageByTemplateId(2,6,5);
    let expectedResult = 'Good evening Hewitt, and welcome to The Fawlty Towers! Room 349 is now ready for you. Enjoy your stay, and let us know if you need anything.';
    if (testResult === expectedResult) {
      return 'Success for Template Assertion Test 2';
    }
    else {
      console.log(testResult);
      return 'Failed Template Assertion Test 2'
    }
}

// console.log(templateAssertion());
// console.log(userTextAssertion());
console.log(userTextAssertion());
let dataTrial = new DataDomainManager();
let timeUtility = new TimeUtility();
let message = new MessageCenter(dataTrial, timeUtility);
// console.log(message.renderMessageByTemplateId(1, 1, 1));
