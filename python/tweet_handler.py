import tweepy
import os
import time
import cryptocode
from dotenv import load_dotenv
load_dotenv()


ENCODE_KEY = "encrypt"


class TweetHandler:
    def __init__(self):
        api_key = os.getenv("TWITTER_API_KEY")
        api_secret = os.getenv("TWITTER_API_SECRET")
        access_token = os.getenv("TWITTER_ACCESS_TOKEN")
        access_token_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        bearer_token = os.getenv("BEARER_TOKEN")
        self.client = tweepy.Client(bearer_token, api_key, api_secret, access_token, access_token_secret)

    def exec_like(self):
        key = "encrypt"
        with open("encoded_username.csv", "r") as f:
            data = f.read()
            encoded_username_list = data.splitlines()
            for i, encoded_username in enumerate(encoded_username_list):
                username = cryptocode.decrypt(encoded_username, key)
                print(username)

    def encrypt(self):
        key = "encrypt"
        encoded_username_list = []
        with open("username.csv", "r") as f:
            data = f.read()
            data_list = data.splitlines()
            for i, username in enumerate(data_list):
                if i%100 == 0:
                    print(f"{i}/{len(data_list)}")
                encoded_username = cryptocode.encrypt(username, key)
                encoded_username_list.append(encoded_username)
        print(len(encoded_username_list))
        with open("encoded_username.csv", "w") as f:
            for encoded_username in encoded_username_list:
                f.write(encoded_username + "\n")

    # def get_users_followers(self):
    #     id = ""
    #     continue_flag = True
    #     next_token = None
    #     user_name_list = []
    #     while continue_flag:
    #         # user_fields ref:https://developer.twitter.com/en/docs/twitter-api/data-dictionary/object-model/user
    #         response = self.client.get_users_followers(id, max_results=1000, pagination_token=next_token, user_fields="protected")
    #         for user in response.data:
    #             if user["protected"]:
    #                 continue
    #             user_name_list.append(user.username)
    #         next_token = response.meta.get("next_token")
    #         if not next_token:
    #             continue_flag = False
    #         time.sleep(90)
    #     with open("username.csv", "w") as f:
    #         for user_name in user_name_list:
    #             f.write(user_name + "\n")


if __name__ == "__main__":
    tweet_handler = TweetHandler()
    tweet_handler.exec_like()
