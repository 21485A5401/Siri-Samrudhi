


const getapi = async (req, res) => {
    try {
        res.status(200).json("This Is get API")
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getapi
}