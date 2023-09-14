import { Schema, model, connect } from 'mongoose';

interface Metrics {
  ADS: number;
  ServicesNumber: number;
  SC: number;
  SCF: number;
  ADSA: number;
  GiniADS: number;
}

const uri: string = 'mongodb://127.0.0.1:27017/coupling_metrics';

connect(uri);
// , (err: any) => {
//   if (err) {
//     console.log("MongoDB connection error: " + err);
//   } else {
//     console.log("MongoDB successfully connected");
//   }
// })
