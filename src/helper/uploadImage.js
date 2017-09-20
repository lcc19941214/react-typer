import axios from 'axios';

export default (url, file, config = {}) => {
  const data = new FormData();
  data.append('file', file);
  return axios
    .post(url, data, config)
    .then(res => {
      return res;
    })
    .catch(err => {
      console.log;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(err);
        }, 2000);
      });
    });
};
