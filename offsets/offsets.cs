/* =============================================================
/*                       Red's Offsets
/*                  https://getadrenaline.dev/offsets
/* -------------------------------------------------------------
/*  Dumped With     : RbxDumperV2 v2.2.4
/*  Roblox Version  : version-f0ea5da9412f4e35
/*  Total Offsets   : 393
/* -------------------------------------------------------------
/*  Offsets by Theo (https://offsets.imtheo.lol)
/*  Join the discord!
/*  https://getadrenaline.dev/discord
/* =============================================================
*/
using System;

namespace RobloxOffsets
{
    public static class Metadata
    {
        public const string RobloxVersion = "version-f0ea5da9412f4e35";
    }

    public static class AirProperties
    {
        public const ulong AirDensity = 0x18;
        public const ulong GlobalWind = 0x3C;
    }

    public static class AnimationTrack
    {
        public const ulong Animation = 0xA0;
        public const ulong Animator = 0xF8;
        public const ulong IsPlaying = 0xA10;
        public const ulong Looped = 0xCD;
        public const ulong Speed = 0xBC;
        public const ulong TimePosition = 0xC0;
    }

    public static class Animator
    {
        public const ulong ActiveAnimations = 0x900;
    }

    public static class Atmosphere
    {
        public const ulong Color = 0xA0;
        public const ulong Decay = 0xAC;
        public const ulong Density = 0xB8;
        public const ulong Glare = 0xBC;
        public const ulong Haze = 0xC0;
        public const ulong Offset = 0xC4;
    }

    public static class Attachment
    {
        public const ulong Position = 0xAC;
    }

    public static class BasePart
    {
        public const ulong CastShadow = 0x120;
        public const ulong Color3 = 0x11C;
        public const ulong Locked = 0x121;
        public const ulong Massless = 0x122;
        public const ulong Primitive = 0x178;
        public const ulong Reflectance = 0xF4;
        public const ulong Shape = 0x1A0;
        public const ulong Transparency = 0x118;
    }

    public static class Beam
    {
        public const ulong Attachment0 = 0x148;
        public const ulong Attachment1 = 0x158;
        public const ulong Brightness = 0x168;
        public const ulong CurveSize0 = 0x16C;
        public const ulong CurveSize1 = 0x170;
        public const ulong LightEmission = 0x174;
        public const ulong LightInfluence = 0x178;
        public const ulong Texture = 0x128;
        public const ulong TextureLength = 0x184;
        public const ulong TextureSpeed = 0x18C;
        public const ulong Width0 = 0x190;
        public const ulong Width1 = 0x194;
        public const ulong ZOffset = 0x198;
    }

    public static class BloomEffect
    {
        public const ulong Enabled = 0x98;
        public const ulong Intensity = 0xA0;
        public const ulong Size = 0xA4;
        public const ulong Threshold = 0xA8;
    }

    public static class BlurEffect
    {
        public const ulong Enabled = 0x98;
        public const ulong Size = 0xA0;
    }

    public static class ByteCode
    {
        public const ulong Pointer = 0x10;
        public const ulong Size = 0x28;
    }

    public static class CachedItem
    {
        public const ulong FileMeshData = 0x28;
    }

    public static class Camera
    {
        public const ulong CameraSubject = 0xB0;
        public const ulong CameraType = 0x120;
        public const ulong FieldOfView = 0x128;
        public const ulong ImagePlaneDepth = 0x2D4;
        public const ulong Position = 0xE4;
        public const ulong Rotation = 0xC0;
        public const ulong Viewport = 0x284;
        public const ulong ViewportSize = 0x2C4;
    }

    public static class CharacterMesh
    {
        public const ulong BaseTextureId = 0xB0;
        public const ulong BodyPart = 0x130;
        public const ulong MeshId = 0xE0;
        public const ulong OverlayTextureId = 0x110;
    }

    public static class ClickDetector
    {
        public const ulong MaxActivationDistance = 0xD0;
        public const ulong MouseIcon = 0xB0;
    }

    public static class Clothing
    {
        public const ulong Color3 = 0x108;
        public const ulong Template = 0xE8;
    }

    public static class ColorCorrectionEffect
    {
        public const ulong Brightness = 0xAC;
        public const ulong Contrast = 0xB0;
        public const ulong Enabled = 0x98;
        public const ulong TintColor = 0xA0;
    }

    public static class ColorGradingEffect
    {
        public const ulong Enabled = 0x98;
        public const ulong TonemapperPreset = 0xA0;
    }

    public static class DataModel
    {
        public const ulong CreatorId = 0x170;
        public const ulong GameId = 0x178;
        public const ulong GameLoaded = 0x588;
        public const ulong JobId = 0x108;
        public const ulong PlaceId = 0x180;
        public const ulong PlaceVersion = 0x19C;
        public const ulong PrimitiveCount = 0x410;
        public const ulong ScriptContext = 0x440;
        public const ulong ServerIP = 0x570;
        public const ulong ToRenderView1 = 0x1B8;
        public const ulong ToRenderView2 = 0x8;
        public const ulong ToRenderView3 = 0x28;
        public const ulong Workspace = 0x148;
    }

    public static class DepthOfFieldEffect
    {
        public const ulong Enabled = 0x98;
        public const ulong FarIntensity = 0xA0;
        public const ulong FocusDistance = 0xA4;
        public const ulong InFocusRadius = 0xA8;
        public const ulong NearIntensity = 0xAC;
    }

    public static class DragDetector
    {
        public const ulong ActivatedCursorIcon = 0x188;
        public const ulong CursorIcon = 0xB0;
        public const ulong MaxActivationDistance = 0xD0;
        public const ulong MaxDragAngle = 0x270;
        public const ulong MaxDragTranslation = 0x234;
        public const ulong MaxForce = 0x274;
        public const ulong MaxTorque = 0x278;
        public const ulong MinDragAngle = 0x27C;
        public const ulong MinDragTranslation = 0x240;
        public const ulong ReferenceInstance = 0x1B8;
        public const ulong Responsiveness = 0x288;
    }

    public static class FakeDataModel
    {
        public const ulong Pointer = 0x8EB6960;
        public const ulong RealDataModel = 0x1F8;
    }

    public static class FileMeshData
    {
        public const ulong AABBMax = 0x18C;
        public const ulong AABBMin = 0x180;
        public const ulong Faces = 0x30;
        public const ulong FacesEnd = 0x38;
        public const ulong Vertices = 0x0;
        public const ulong VerticesEnd = 0x8;
    }

    public static class GuiBase2D
    {
        public const ulong AbsolutePosition = 0xF4;
        public const ulong AbsoluteRotation = 0xD0;
        public const ulong AbsoluteSize = 0x0;
    }

    public static class GuiObject
    {
        public const ulong BackgroundColor3 = 0x508;
        public const ulong BackgroundTransparency = 0x514;
        public const ulong BorderColor3 = 0x514;
        public const ulong Image = 0x9A8;
        public const ulong LayoutOrder = 0x544;
        public const ulong Position = 0x4D8;
        public const ulong RichText = 0xBA0;
        public const ulong Rotation = 0xD0;
        public const ulong ScreenGui_Enabled = 0x490;
        public const ulong Size = 0x4F8;
        public const ulong Text = 0xE08;
        public const ulong TextColor3 = 0xEB8;
        public const ulong Visible = 0x575;
        public const ulong ZIndex = 0x56C;
    }

    public static class Humanoid
    {
        public const ulong AutoJumpEnabled = 0x1C8;
        public const ulong AutomaticScalingEnabled = 0x95;
        public const ulong AutoRotate = 0x1C9;
        public const ulong BreakJointsOnDeath = 0x1CC;
        public const ulong CameraOffset = 0x110;
        public const ulong DisplayDistanceType = 0x174;
        public const ulong DisplayName = 0xA0;
        public const ulong EvaluateStateMachine = 0x1CD;
        public const ulong FloorMaterial = 0x178;
        public const ulong Health = 0x184;
        public const ulong HealthDisplayDistance = 0x17C;
        public const ulong HealthDisplayType = 0x180;
        public const ulong HipHeight = 0x188;
        public const ulong HumanoidRootPart = 0x460;
        public const ulong HumanoidState = 0x8A8;
        public const ulong HumanoidStateID = 0x20;
        public const ulong IsWalking = 0xA2E;
        public const ulong Jump = 0x1D0;
        public const ulong JumpHeight = 0x194;
        public const ulong JumpPower = 0x198;
        public const ulong MaxHealth = 0x19C;
        public const ulong MaxSlopeAngle = 0x1A0;
        public const ulong MoveDirection = 0x134;
        public const ulong MoveToPart = 0x100;
        public const ulong MoveToPoint = 0x158;
        public const ulong NameDisplayDistance = 0x1A4;
        public const ulong NameOcclusion = 0x1A8;
        public const ulong PlatformStand = 0x1D2;
        public const ulong PlatformStatePointer = 0x18AB46F7;
        public const ulong RequiresNeck = 0x1D3;
        public const ulong RigType = 0x1B4;
        public const ulong SeatPart = 0xF0;
        public const ulong Sit = 0x1D3;
        public const ulong TargetPoint = 0x140;
        public const ulong UseJumpPower = 0x1D6;
        public const ulong Walkspeed = 0x1C4;
        public const ulong WalkspeedCheck = 0x39C;
        public const ulong WalkTimer = 0x0;
    }

    public static class Instance
    {
        public const ulong ChildrenEnd = 0x8;
        public const ulong ChildrenStart = 0x70;
        public const ulong ClassBase = 0x1B0;
        public const ulong ClassDescriptor = 0x18;
        public const ulong ClassName = 0x8;
        public const ulong Name = 0x0;
        public const ulong NameContainer = 0x68;
        public const ulong Parent = 0x60;
        public const ulong This = 0x8;
    }

    public static class Lighting
    {
        public const ulong Ambient = 0xB8;
        public const ulong Brightness = 0x100;
        public const ulong ClockTime = 0xB0;
        public const ulong ColorShift_Bottom = 0xD0;
        public const ulong ColorShift_Top = 0xC4;
        public const ulong EnvironmentDiffuseScale = 0x104;
        public const ulong EnvironmentSpecularScale = 0x108;
        public const ulong ExposureCompensation = 0x10C;
        public const ulong FogColor = 0xDC;
        public const ulong FogEnd = 0x114;
        public const ulong FogStart = 0x118;
        public const ulong GeographicLatitude = 0x11C;
        public const ulong GlobalShadows = 0x12C;
        public const ulong GradientBottom = 0x178;
        public const ulong GradientTop = 0x138;
        public const ulong LightColor = 0x144;
        public const ulong LightDirection = 0x150;
        public const ulong MoonPosition = 0x16C;
        public const ulong OutdoorAmbient = 0xE8;
        public const ulong Sky = 0x1B0;
        public const ulong Source = 0x15C;
        public const ulong SunPosition = 0x160;
    }

    public static class LocalScript
    {
        public const ulong ByteCode = 0x0;
        public const ulong GUID = 0xB8;
        public const ulong Hash = 0x188;
    }

    public static class LRUHolder
    {
        public const ulong MemEnforcedLRUCache = 0x20;
    }

    public static class LRUNode
    {
        public const ulong AssetID = 0x10;
        public const ulong CachedItem = 0x38;
        public const ulong Next = 0x0;
    }

    public static class MaterialColors
    {
        public const ulong Asphalt = 0x30;
        public const ulong Basalt = 0x27;
        public const ulong Brick = 0xF;
        public const ulong Cobblestone = 0x33;
        public const ulong Concrete = 0xC;
        public const ulong CrackedLava = 0x2D;
        public const ulong Glacier = 0x1B;
        public const ulong Grass = 0x6;
        public const ulong Ground = 0x2A;
        public const ulong Ice = 0x36;
        public const ulong LeafyGrass = 0x39;
        public const ulong Limestone = 0x3F;
        public const ulong Mud = 0x24;
        public const ulong Pavement = 0x42;
        public const ulong Rock = 0x18;
        public const ulong Salt = 0x3C;
        public const ulong Sand = 0x12;
        public const ulong Sandstone = 0x21;
        public const ulong Slate = 0x9;
        public const ulong Snow = 0x1E;
        public const ulong WoodPlanks = 0x15;
    }

    public static class MemEnforcedLRUCache
    {
        public const ulong Head = 0x8;
    }

    public static class MeshContentProvider
    {
        public const ulong LRUHolder = 0xC0;
    }

    public static class MeshPart
    {
        public const ulong MeshId = 0x2F8;
        public const ulong Texture = 0x328;
    }

    public static class Misc
    {
        public const ulong Adornee = 0xD8;
        public const ulong AnimationId = 0xA8;
        public const ulong StringLength = 0x10;
        public const ulong Value = 0xA0;
    }

    public static class Model
    {
        public const ulong PrimaryPart = 0x240;
        public const ulong Scale = 0x12C;
    }

    public static class ModuleScript
    {
        public const ulong ByteCode = 0x0;
        public const ulong GUID = 0xB8;
        public const ulong Hash = 0x348;
        public const ulong IsCoreScript = 0x0;
    }

    public static class MouseService
    {
        public const ulong InputObject = 0xE8;
        public const ulong InputObject2 = 0xF8;
        public const ulong MousePosition = 0xBC;
        public const ulong SensitivityPointer = 0x0;
    }

    public static class ParticleEmitter
    {
        public const ulong Acceleration = 0x1C8;
        public const ulong Brightness = 0x204;
        public const ulong Drag = 0x208;
        public const ulong Lifetime = 0x1DC;
        public const ulong LightEmission = 0x220;
        public const ulong LightInfluence = 0x224;
        public const ulong Rate = 0x230;
        public const ulong Rotation = 0x1EC;
        public const ulong RotSpeed = 0x1E4;
        public const ulong Speed = 0x1F4;
        public const ulong SpreadAngle = 0x1FC;
        public const ulong Texture = 0x1A8;
        public const ulong TimeScale = 0x244;
        public const ulong VelocityInheritance = 0x248;
        public const ulong ZOffset = 0x24C;
    }

    public static class Player
    {
        public const ulong AccountAge = 0x364;
        public const ulong CameraMode = 0x378;
        public const ulong DisplayName = 0x120;
        public const ulong HealthDisplayDistance = 0x3A0;
        public const ulong LocaleId = 0x100;
        public const ulong LocalPlayer = 0x118;
        public const ulong MaxZoomDistance = 0x370;
        public const ulong MinZoomDistance = 0x374;
        public const ulong ModelInstance = 0x2A0;
        public const ulong Mouse = 0x11F0;
        public const ulong NameDisplayDistance = 0x3B0;
        public const ulong Team = 0x2E0;
        public const ulong TeamColor = 0x3B8;
        public const ulong UserId = 0xB8;
    }

    public static class PlayerConfigurer
    {
        public const ulong Pointer = 0x0;
    }

    public static class PlayerMouse
    {
        public const ulong Icon = 0xB0;
        public const ulong Workspace = 0x138;
    }

    public static class Primitive
    {
        public const ulong AssemblyAngularVelocity = 0xEC;
        public const ulong AssemblyLinearVelocity = 0xE0;
        public const ulong Flags = 0x1BE;
        public const ulong Material = 0x0;
        public const ulong Owner = 0x218;
        public const ulong Position = 0xD4;
        public const ulong Rotation = 0xB0;
        public const ulong Size = 0x1C4;
        public const ulong Validate = 0x6;
    }

    public static class PrimitiveFlags
    {
        public const ulong Anchored = 0x2;
        public const ulong CanCollide = 0x8;
        public const ulong CanQuery = 0x20;
        public const ulong CanTouch = 0x10;
    }

    public static class ProximityPrompt
    {
        public const ulong ActionText = 0x98;
        public const ulong Enabled = 0x11E;
        public const ulong GamepadKeyCode = 0x104;
        public const ulong HoldDuration = 0x108;
        public const ulong KeyCode = 0x10C;
        public const ulong MaxActivationDistance = 0x110;
        public const ulong ObjectText = 0xB8;
        public const ulong RequiresLineOfSight = 0x11F;
    }

    public static class RenderJob
    {
        public const ulong FakeDataModel = 0x38;
        public const ulong RealDataModel = 0x1F0;
        public const ulong RenderView = 0x1E0;
    }

    public static class RenderView
    {
        public const ulong DeviceD3D11 = 0x0;
        public const ulong LightingValid = 0x0;
        public const ulong SkyValid = 0x0;
        public const ulong VisualEngine = 0x0;
    }

    public static class RunService
    {
        public const ulong HeartbeatFPS = 0xF2;
        public const ulong HeartbeatTask = 0x14B80;
    }

    public static class Script
    {
        public const ulong ByteCode = 0x0;
        public const ulong GUID = 0xB8;
        public const ulong Hash = 0x188;
    }

    public static class ScriptContext
    {
        public const ulong RequireBypass = 0x0;
    }

    public static class Seat
    {
        public const ulong Occupant = 0x200;
    }

    public static class Sky
    {
        public const ulong MoonAngularSize = 0x22C;
        public const ulong MoonTextureId = 0xB0;
        public const ulong SkyboxBk = 0xE0;
        public const ulong SkyboxDn = 0x110;
        public const ulong SkyboxFt = 0x140;
        public const ulong SkyboxLf = 0x170;
        public const ulong SkyboxOrientation = 0x220;
        public const ulong SkyboxRt = 0x1A0;
        public const ulong SkyboxUp = 0x1D0;
        public const ulong StarCount = 0x230;
        public const ulong SunAngularSize = 0x224;
        public const ulong SunTextureId = 0x200;
    }

    public static class Sound
    {
        public const ulong IsPlaying = 0x130;
        public const ulong Looped = 0x12D;
        public const ulong PlaybackSpeed = 0x10C;
        public const ulong RollOffMaxDistance = 0x110;
        public const ulong RollOffMinDistance = 0x114;
        public const ulong SoundGroup = 0xD0;
        public const ulong SoundId = 0xB0;
        public const ulong Volume = 0x120;
    }

    public static class SpawnLocation
    {
        public const ulong AllowTeamChangeOnTouch = 0x3D;
        public const ulong Enabled = 0x1D9;
        public const ulong ForcefieldDuration = 0x1D0;
        public const ulong Neutral = 0x1DA;
        public const ulong TeamColor = 0x1D4;
    }

    public static class SpecialMesh
    {
        public const ulong MeshId = 0xE0;
        public const ulong Scale = 0xAC;
    }

    public static class StatsItem
    {
        public const ulong Value = 0x30E0;
    }

    public static class SunRaysEffect
    {
        public const ulong Enabled = 0x98;
        public const ulong Intensity = 0xA0;
        public const ulong Spread = 0xA4;
    }

    public static class SurfaceAppearance
    {
        public const ulong AlphaMode = 0x1D8;
        public const ulong Color = 0x1C0;
        public const ulong ColorMap = 0xB0;
        public const ulong EmissiveMaskContent = 0xE0;
        public const ulong EmissiveStrength = 0x1DC;
        public const ulong EmissiveTint = 0x1CC;
        public const ulong MetalnessMap = 0x110;
        public const ulong NormalMap = 0x140;
        public const ulong RoughnessMap = 0x170;
    }

    public static class TaskScheduler
    {
        public const ulong JobEnd = 0xD0;
        public const ulong JobName = 0x18;
        public const ulong JobStart = 0xC8;
        public const ulong MaxFPS = 0xB0;
        public const ulong Pointer = 0x8E4D7B8;
    }

    public static class Team
    {
        public const ulong BrickColor = 0xA0;
    }

    public static class Terrain
    {
        public const ulong GrassLength = 0x1D8;
        public const ulong MaterialColors = 0x4A0;
        public const ulong WaterColor = 0x1C8;
        public const ulong WaterReflectance = 0x1E0;
        public const ulong WaterTransparency = 0x1E4;
        public const ulong WaterWaveSize = 0x1E8;
        public const ulong WaterWaveSpeed = 0x1EC;
    }

    public static class Textures
    {
        public const ulong Decal_Texture = 0x1C8;
        public const ulong Texture_Texture = 0x1C8;
    }

    public static class Tool
    {
        public const ulong CanBeDropped = 0x365;
        public const ulong Enabled = 0x95;
        public const ulong Grip = 0x494;
        public const ulong ManualActivationOnly = 0x4A2;
        public const ulong RequiresHandle = 0x4A3;
        public const ulong TextureId = 0x348;
        public const ulong Tooltip = 0x450;
    }

    public static class UnionOperation
    {
        public const ulong AssetId = 0x2F8;
    }

    public static class UserInputService
    {
        public const ulong WindowInputState = 0x288;
    }

    public static class VehicleSeat
    {
        public const ulong MaxSpeed = 0x210;
        public const ulong SteerFloat = 0x214;
        public const ulong ThrottleFloat = 0x218;
        public const ulong Torque = 0x21C;
        public const ulong TurnSpeed = 0x220;
    }

    public static class VisualEngine
    {
        public const ulong Dimensions = 0xB10;
        public const ulong FakeDataModel = 0xAF0;
        public const ulong Pointer = 0x8942E38;
        public const ulong RenderView = 0xC50;
        public const ulong ViewMatrix = 0x1B0;
    }

    public static class Weld
    {
        public const ulong Part0 = 0x100;
        public const ulong Part1 = 0x110;
    }

    public static class WeldConstraint
    {
        public const ulong Part0 = 0xA0;
        public const ulong Part1 = 0xB0;
    }

    public static class WindowInputState
    {
        public const ulong CapsLock = 0x40;
        public const ulong CurrentTextBox = 0x48;
    }

    public static class Workspace
    {
        public const ulong CurrentCamera = 0x4A0;
        public const ulong DistributedGameTime = 0x4C0;
        public const ulong ReadOnlyGravity = 0x9D0;
        public const ulong World = 0x3F8;
    }

    public static class World
    {
        public const ulong AirProperties = 0x230;
        public const ulong FallenPartsDestroyHeight = 0x20C;
        public const ulong Gravity = 0x218;
        public const ulong Primitives = 0x2A0;
        public const ulong worldStepsPerSec = 0x868;
    }

} // namespace RobloxOffsets
