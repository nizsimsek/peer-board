import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import WelcomeImage from "@/assets/welcome.webp";
import { useLangStore } from "@/store/lang.store";
import { useNavigate } from "react-router";
import { useState } from "react";
import LangSwitcher from "@/components/lang-switcher";
import ThemeSwitcher from "@/components/theme-switcher";

const Welcome = () => {
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roomLink, setRoomLink] = useState("");

  const createRoom = () => {
    let roomId = Math.random().toString(36).substring(2, 15);
    navigate(`/room/${roomId}?name=${name}&password=${password}`);
  };

  const joinRoom = () => {
    navigate(`/room/${roomLink}?name=${name}&password=${password}`);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 bg-zinc-200 dark:bg-zinc-800">
      <ThemeSwitcher className="absolute top-2 right-2" />
      <LangSwitcher className="absolute top-2 left-2" />
      <div className="w-full max-w-sm md:max-w-3xl mt-8 md:mt-0">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid md:grid-cols-2 p-2 md:p-4">
              <Tabs defaultValue="create-room">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create-room">
                    {lang === "tr" ? "Oda Oluştur" : "Create Room"}
                  </TabsTrigger>
                  <TabsTrigger value="join-room">
                    {lang === "tr" ? "Odaya Katıl" : "Join Room"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="create-room">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {lang === "tr" ? "Oda Oluştur" : "Create Room"}
                      </CardTitle>
                      <CardDescription>
                        {lang === "tr"
                          ? "Oda oluşturun ve arkadaşlarınızla linkini paylaşın."
                          : "Create a room and share the link with your friends."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="fullName">
                          {lang === "tr" ? "Adınız" : "Your Name"}
                        </Label>
                        <Input
                          id="fullName"
                          placeholder={lang === "tr" ? "Adınız" : "Your Name"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="password">
                          {lang === "tr" ? "Oda Şifresi" : "Room Password"}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={createRoom}>
                        {lang === "tr" ? "Oda Oluştur" : "Create Room"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="join-room">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {lang === "tr" ? "Odaya Katıl" : "Join Room"}
                      </CardTitle>
                      <CardDescription>
                        {lang === "tr"
                          ? "Odaya katılmak için oda linkini ve şifreyi giriniz."
                          : "Join a room by entering the room link and password."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="fullName">
                          {lang === "tr" ? "Adınız" : "Your Name"}
                        </Label>
                        <Input
                          id="fullName"
                          placeholder={lang === "tr" ? "Adınız" : "Your Name"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="roomLink">
                          {lang === "tr" ? "Oda Linki" : "Room Link"}
                        </Label>
                        <Input
                          id="roomLink"
                          placeholder={
                            lang === "tr" ? "Oda Linki" : "Room Link"
                          }
                          value={roomLink}
                          onChange={(e) => setRoomLink(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="password">
                          {lang === "tr" ? "Oda Şifresi" : "Room Password"}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={joinRoom}>
                        {lang === "tr" ? "Odaya Katıl" : "Join Room"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              <div className="relative hidden bg-muted md:block">
                <img
                  src={WelcomeImage}
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-contain max-h-[300px] m-auto"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-xs text-center [&_a]:underline [&_a]:underline-offset-4 text-zinc-950 dark:text-zinc-50">
            <div className="space-y-1">
              <p>
                © {new Date().getFullYear()} Peer Board v0.0.1 -{" "}
                {lang === "tr"
                  ? "Tüm Hakları Saklıdır."
                  : "All Rights Reserved."}
              </p>
              <p>
                {lang === "tr"
                  ? "Tasarım ve Geliştirme "
                  : "Design and Development by "}
                <a
                  href="https://nizamettinsimsek.com.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nizamettin Şimşek
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
