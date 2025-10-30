import { createRouter, createWebHistory, useRouter } from "vue-router";
import MainView from "@/views/MainView.vue";
import MainPage from "@/pages/MainPage.vue";
import Profile from "@/components/Profile.vue";
import PageView from "@/views/PageView.vue";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "vue-toastification";
import Terms from "@/pages/Terms.vue";
import Forum from "@/pages/Forum.vue";
import ForumThemes from "@/pages/ForumThemes.vue";
import ForumSeparateTheme from "@/pages/ForumSeparateTheme.vue";
import ForumCreateTheme from "@/pages/ForumCreateTheme.vue";
import CreateNews from "@/pages/CreateNews.vue";
import SingleNews from "@/pages/SingleNews.vue";
import Leaderboard from "@/pages/Leaderboard.vue";
import AdminPanel from "@/pages/AdminPanel.vue";
import SupportChat from "@/pages/SupportChat.vue";
import SupportChatTheme from "@/pages/SupportChatTheme.vue";
import SupportProject from "@/pages/SupportProject.vue";
import Download from "@/pages/Download.vue";
import About from "@/pages/AboutServer.vue";
import AboutServer from "@/pages/AboutServer.vue";
import AllNews from "@/pages/AllNews.vue";
import NotFound from "@/pages/NotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      component: MainView,
      children: [
        {
          path: "",
          name: "home",
          component: MainPage,
        },
      ],
    },
    {
      path: "/page",
      component: PageView,
      children: [
        {
          path: "/page/profile",
          name: "profile",
          component: Profile,
          meta: { requiresAuth: true },
        },
        {
          path: "/page/forum",
          name: "forum",
          component: Forum,
        },
        {
          path: "/page/themes/:cat_id/:sub_id",
          name: "themes",
          component: ForumThemes,
        },
        {
          path: "/page/separate-theme/:theme_id/:cat_id",
          name: "separate-theme",
          component: ForumSeparateTheme,
        },
        {
          path: "/page/theme-creation/:id_main/:id?",
          name: "theme-creation",
          component: ForumCreateTheme,
          meta: { requiresAuth: true },
        },
        {
          path: "/page/news-creation/:id?",
          name: "news-creation",
          component: CreateNews,
          meta: { requiresAuth: true, onlyAdmin: true },
        },
        {
          path: "/page/single-news/:id",
          name: "single-news",
          component: SingleNews,
        },
        {
          path: "/page/leaderboard",
          name: "leaderboard",
          component: Leaderboard,
        },
        {
          path: "/page/support-project",
          name: "support-project",
          component: SupportProject,
        },
        {
          path: "/page/support-chat",
          name: "support-chat",
          meta: { requiresAuth: true },
          component: SupportChat,
        },
        {
          path: "/page/support-chat-theme/:theme_id",
          name: "support-chat-theme",
          meta: { requiresAuth: true },
          component: SupportChatTheme,
        },
        {
          path: "/page/admin-panel",
          name: "admin-panel",
          meta: { requiresAuth: true, onlyAdmin: true },
          component: AdminPanel,
        },
      ],
    },
    {
      path: "/all-news",
      name: "all-news",
      component: AllNews,
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: Leaderboard,
    },
    {
      path: "/about-server",
      name: "about-server",
      component: AboutServer,
    },
    {
      path: "/support-project",
      name: "support-project",
      component: SupportProject,
    },
    {
      path: "/download",
      name: "download-page",
      component: Download,
    },
    {
      path: "/single-news/:id",
      name: "single-news",
      component: SingleNews,
    },
    {
      path: "/terms",
      component: Terms,
      name: "terms",
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
    },
  ],
});

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  const toast = useToast();
  await userStore.loadUser();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    toast.error("Потрібно авторизуватися");
    return { name: "home" };
  }

  if (to.meta.onlyAdmin && !userStore.isAdmin) {
    toast.error("Пішов геть, ти не адмін");
    return { name: "home" };
  }
});

export default router;
