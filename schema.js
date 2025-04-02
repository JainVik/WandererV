const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        category: Joi.string()
            .valid( 'Lakefront', 'Beaches', 'Rooms', 'Parties','Tours','Villas')
            .required(), // Validate the category field with allowed values
    }).required()
})
  
//server side validation for reviews

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating  : Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
    })
