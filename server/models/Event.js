import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String
    },
    date: {
        type: String
    },
    description: {
        type: String
    },
    url: {
        type: String
    },
    image: {
        type: String
    },
});

export default mongoose.model("Event", eventSchema);
