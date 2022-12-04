const { default: axios } = require('axios');
const {LOG} = require('../../logger/logger');

const callCommand = async (uri, method, data, token = null) => {
    const dtoIn = _prepareAxiosConfig(uri, method, data, token);
    const response = await axios(dtoIn);
    LOG.debug(`Calling command ${method}: ${uri} with dtoIn:\n${stringifyDtoIn(dtoIn)}`);
    return response.data;

};

const _prepareAxiosConfig = (uri, method, data, token = null) => {
    const dtoIn = {
        url: uri,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        method: token ? method : 'POST',
        data: JSON.stringify(data)
    };
    if (token) {
        dtoIn.headers.Authorization = `Bearer ${token}`;
    }
    return dtoIn;
};

/**
 * Transforms dtoIn into the string value and removes any confidential information from it.
 *
 * @param dtoIn
 */
const stringifyDtoIn = (dtoIn) => JSON.stringify({ ...dtoIn, headers: { ...dtoIn.headers, Authorization: '***' }, agent: null }, null, 4);

module.exports = {
    callCommand
};
