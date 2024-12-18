import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";
import config from "@/config";
import clientPromise from "./mongo";
import connectMongo from "./mongoose";
import User from "@/models/User";

export const authOptions = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    ...(process.env.MONGODB_URI
      ? [
          EmailProvider({
            server: {
              host: "smtp.resend.com",
              port: 465,
              auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: config.resend.fromNoReply,
          }),
        ]
      : []),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
        try {
          if (mongoose.connection.readyState !== 1) {
            await connectMongo();
          }
          const user = await User.findById(token.sub).select('company').lean();
          session.user.company = user?.company ? user.company.toString() : null;
        } catch (error) {
          console.error('Error fetching user company:', error);
          session.user.company = null;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};
